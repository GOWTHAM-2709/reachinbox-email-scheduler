import { Queue, Job } from 'bullmq';
import { config } from '../config/env';
import IORedis from 'ioredis';

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('emailQueue', { connection });

export const scheduleEmailJob = async (
  emailId: string,
  userId: string,
  campaignId: string,
  scheduledAt: Date,
  delayBetweenEmails: number,
  hourlyLimit: number
) => {
  const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());

  await emailQueue.add(
    'sendEmail',
    {
      emailId,
      userId,
      campaignId,
      delayBetweenEmails,
      hourlyLimit,
    },
    {
      jobId: `email-${emailId}`, // ensure unique job per email
      delay: delayMs,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s, 25s, 125s
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};
