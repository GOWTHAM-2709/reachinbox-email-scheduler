// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DelayedError } from 'bullmq';

// Mock dependencies BEFORE importing the module under test
jest.mock('bullmq', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
  DelayedError: class DelayedError extends Error {},
}));

const mockEval = jest.fn<any>().mockResolvedValue(1);
const mockIncr = jest.fn<any>().mockResolvedValue(1);
const mockExpire = jest.fn<any>().mockResolvedValue(1);

jest.mock('ioredis', () => {
  const m = jest.fn<any>().mockImplementation(() => ({
    eval: mockEval,
    incr: mockIncr,
    expire: mockExpire,
    on: jest.fn<any>(),
  }));
  return {
    __esModule: true,
    default: m,
  };
});

jest.mock('../src/config/db', () => ({
  __esModule: true,
  default: {
    email: {
      updateMany: jest.fn<any>().mockResolvedValue({ count: 1 }),
      findUnique: jest.fn<any>().mockResolvedValue({
        id: 'email-1',
        recipient: 'test@example.com',
        subject: 'Test',
        body: 'Body',
        status: 'scheduled'
      }),
      update: jest.fn<any>().mockResolvedValue({}),
    }
  }
}));

jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn<any>().mockResolvedValue({ messageId: '12345', previewUrl: 'http://test' }),
}));

jest.mock('../src/services/slack.service', () => ({
  sendRateLimitNotification: jest.fn<any>().mockResolvedValue(undefined),
}));

jest.mock('../src/services/elasticsearch.service', () => ({
  indexEmail: jest.fn<any>().mockResolvedValue(undefined),
}));

jest.mock('../src/config/env', () => ({
  config: {
    redisUrl: 'redis://localhost:6379',
    limits: { workerConcurrency: 1 }
  }
}));

// Now import the worker processor
import { processEmailJob } from '../src/queues/email.worker';
import prisma from '../src/config/db';
import { sendEmail } from '../src/services/email.service';
import { sendRateLimitNotification } from '../src/services/slack.service';

const processor = processEmailJob;

describe('Email Worker Logic', () => {
  let mockJob: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJob = {
      id: 'job-1',
      data: {
        emailId: 'email-1',
        userId: 'user-1',
        delayBetweenEmails: 2,
        hourlyLimit: 10
      },
      token: 'token-1',
      moveToDelayed: jest.fn<any>().mockResolvedValue(undefined),
    };
    
    // Reset our mock default returns
    mockEval.mockResolvedValue(1);
    mockIncr.mockResolvedValue(1);
    mockExpire.mockResolvedValue(1);
    (sendEmail as jest.Mock<any>).mockResolvedValue({ messageId: '12345', previewUrl: 'http://test' });
    (prisma.email.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });
  });

  it('should atomically claim email with scheduled -> processing status update', async () => {
    await processor(mockJob);

    expect(prisma.email.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'email-1',
        status: 'scheduled',
      },
      data: {
        status: 'processing',
        attempts: { increment: 1 },
      },
    });
  });

  it('should skip processing if idempotency check fails (email already sent)', async () => {
    // Return count 0 for updateMany (another worker claimed it or it was sent)
    (prisma.email.updateMany as jest.Mock<any>).mockResolvedValueOnce({ count: 0 });
    (prisma.email.findUnique as jest.Mock<any>).mockResolvedValueOnce({ status: 'sent' });

    await processor(mockJob);

    expect(prisma.email.updateMany).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should delay the job if minimum delay is not met (minimum delay coordination)', async () => {
    // Return a timestamp instead of 1 (meaning delay not met)
    const nextSendTime = Date.now() + 5000;
    mockEval.mockResolvedValueOnce(nextSendTime);

    await expect(processor(mockJob)).rejects.toThrow(DelayedError);

    expect(prisma.email.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'email-1' },
      data: { status: 'scheduled' }
    }));
    expect(mockJob.moveToDelayed).toHaveBeenCalledWith(nextSendTime, 'token-1');
  });

  it('should reschedule to the next hour and trigger Slack rate-limit notification if hourly limit is reached', async () => {
    // Redis incr returns 11 (hourly limit is 10)
    mockEval.mockResolvedValueOnce(1); // Min delay passes
    mockIncr.mockResolvedValueOnce(11);

    await expect(processor(mockJob)).rejects.toThrow(DelayedError);

    // Expect slack notification
    expect(sendRateLimitNotification).toHaveBeenCalledWith('user-1', expect.any(String));
    
    // Expect reschedule
    expect(mockJob.moveToDelayed).toHaveBeenCalled();
    expect(prisma.email.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'email-1' },
      data: { status: 'scheduled' }
    }));
  });

  it('should process and send the email successfully', async () => {
    await processor(mockJob);

    expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Test', 'Body');
    expect(prisma.email.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'email-1' },
      data: expect.objectContaining({ status: 'sent' })
    }));
  });

  it('should handle SMTP failure by marking email as failed and re-throwing error for BullMQ retry', async () => {
    const smtpError = new Error('SMTP connection timed out');
    (sendEmail as jest.Mock<any>).mockRejectedValueOnce(smtpError);

    await expect(processor(mockJob)).rejects.toThrow('SMTP connection timed out');

    expect(prisma.email.update).toHaveBeenCalledWith({
      where: { id: 'email-1' },
      data: { status: 'failed' }
    });
  });
});
