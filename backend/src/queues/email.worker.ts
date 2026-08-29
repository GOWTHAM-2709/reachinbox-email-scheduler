import { Worker, Job, DelayedError } from 'bullmq';
import { config } from '../config/env';
import IORedis from 'ioredis';
import prisma from '../config/db';
import { sendEmail } from '../services/email.service';
import { sendRateLimitNotification } from '../services/slack.service';
import { indexEmail } from '../services/elasticsearch.service';

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

export const processEmailJob = async (job: Job) => {
  const { emailId, userId, delayBetweenEmails, hourlyLimit } = job.data;

    // 1. Check Idempotency: Transition from 'scheduled' -> 'processing' atomically
    const claimResult = await prisma.email.updateMany({
      where: {
        id: emailId,
        status: 'scheduled',
      },
      data: {
        status: 'processing',
        attempts: { increment: 1 },
      },
    });

    if (claimResult.count === 0) {
      // Job is not in 'scheduled' state. It might be already processed or currently processing.
      // If retried after failure, we can manually check if it was 'failed' or 'processing' and allow retry.
      const emailRecord = await prisma.email.findUnique({ where: { id: emailId } });
      if (emailRecord?.status === 'sent') {
        console.log(`Email ${emailId} already sent, skipping.`);
        return; // Idempotent success
      }
      if (emailRecord?.status === 'processing') {
         // It might be a crashed job retry. We can allow it.
         await prisma.email.update({
            where: { id: emailId },
            data: { attempts: { increment: 1 } }
         });
      }
    }

    const email = await prisma.email.findUnique({ where: { id: emailId } });
    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    // 2. Minimum Delay Coordination
    // We use a Redis key to store the timestamp of the last attempt to send for this user
    const lastSendKey = `last-send:${userId}`;
    
    // We use a Redis script to atomically check and update the last send time
    // If Date.now() - lastSend < minDelay, we delay the job.
    const now = Date.now();
    const minDelayMs = delayBetweenEmails * 1000;
    
    const luaScript = `
      local lastSend = redis.call("GET", KEYS[1])
      if not lastSend then
        redis.call("SET", KEYS[1], ARGV[1])
        return 1
      end
      
      local diff = tonumber(ARGV[1]) - tonumber(lastSend)
      if diff >= tonumber(ARGV[2]) then
        redis.call("SET", KEYS[1], ARGV[1])
        return 1
      else
        return tonumber(lastSend) + tonumber(ARGV[2])
      end
    `;
    
    const result = await connection.eval(luaScript, 1, lastSendKey, now, minDelayMs);
    
    if (result !== 1) {
      const nextSendTime = result as number;
      // Revert status to scheduled since we didn't process it
      await prisma.email.update({
        where: { id: emailId },
        data: { status: 'scheduled' }
      });
      // Move to delayed
      await job.moveToDelayed(nextSendTime, job.token!);
      throw new DelayedError();
    }

    // 3. Hourly Rate Limiting
    const currentHour = new Date().toISOString().slice(0, 13); // e.g. "2023-10-27T14"
    const rateLimitKey = `rate-limit:${userId}:${currentHour}`;
    
    const currentCount = await connection.incr(rateLimitKey);
    if (currentCount === 1) {
      await connection.expire(rateLimitKey, 3600);
    }

    if (currentCount > hourlyLimit) {
      // Revert status to scheduled
      await prisma.email.update({
        where: { id: emailId },
        data: { status: 'scheduled' }
      });
      
      // Calculate next hour window start time
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0, 0, 0);
      
      // Send Slack notification
      await sendRateLimitNotification(userId, currentHour);
      
      await job.moveToDelayed(nextHour.getTime(), job.token!);
      throw new DelayedError();
    }

    // 4. Send Email via Nodemailer (Ethereal)
    try {
      const sendResult = await sendEmail(email.recipient, email.subject, email.body);
      
      // 5. Update Database atomically
      const updatedEmail = await prisma.email.update({
        where: { id: emailId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: sendResult.messageId,
        },
      });

      // 6. Index into Elasticsearch
      await indexEmail(updatedEmail);
      
      console.log(`Email ${emailId} sent successfully. Preview: ${sendResult.previewUrl}`);
      
    } catch (error) {
      // On failure, mark as failed so it can be retried by BullMQ
      await prisma.email.update({
        where: { id: emailId },
        data: { status: 'failed' }
      });
      throw error;
    }
};

export const emailWorker = new Worker('emailQueue', processEmailJob, {
  connection,
  concurrency: config.limits.workerConcurrency,
});

emailWorker.on('failed', (job, err) => {
  if (!(err instanceof DelayedError)) {
    console.error(`Job ${job?.id} failed with error ${err.message}`);
  }
});
