// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSetnx = jest.fn<any>();
const mockExpire = jest.fn<any>().mockResolvedValue(1);

jest.mock('../src/config/redis', () => ({
  __esModule: true,
  default: {
    setnx: mockSetnx,
    expire: mockExpire,
  },
}));

jest.mock('../src/config/db', () => ({
  __esModule: true,
  default: {
    slackConnection: {
      findUnique: jest.fn<any>(),
    },
    user: {
      findUnique: jest.fn<any>(),
    },
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn<any>(),
  },
}));

import { sendRateLimitNotification } from '../src/services/slack.service';
import redis from '../src/config/redis';
import prisma from '../src/config/db';
import axios from 'axios';

describe('Slack Rate-Limit Notification & Deduplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send Slack notification when first rate-limit is triggered for the hour window', async () => {
    mockSetnx.mockResolvedValueOnce(1); // First notification this hour
    (prisma.slackConnection.findUnique as jest.Mock<any>).mockResolvedValueOnce({
      userId: 'user-1',
      accessToken: 'xoxp-mock-token',
    });
    (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
    });
    (axios.post as jest.Mock<any>)
      .mockResolvedValueOnce({ data: { ok: true, user_id: 'U12345' } }) // auth.test
      .mockResolvedValueOnce({ data: { ok: true } }); // chat.postMessage

    await sendRateLimitNotification('user-1', '2026-08-29T11');

    expect(redis.setnx).toHaveBeenCalledWith('slack-notified:user-1:2026-08-29T11', '1');
    expect(redis.expire).toHaveBeenCalledWith('slack-notified:user-1:2026-08-29T11', 3600);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('should deduplicate and skip sending Slack notification if already notified this hour', async () => {
    mockSetnx.mockResolvedValueOnce(0); // Already notified this hour

    await sendRateLimitNotification('user-1', '2026-08-29T11');

    expect(redis.setnx).toHaveBeenCalledWith('slack-notified:user-1:2026-08-29T11', '1');
    expect(prisma.slackConnection.findUnique).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should silently succeed without error if Slack is not connected', async () => {
    mockSetnx.mockResolvedValueOnce(1);
    (prisma.slackConnection.findUnique as jest.Mock<any>).mockResolvedValueOnce(null);

    await sendRateLimitNotification('user-1', '2026-08-29T11');

    expect(axios.post).not.toHaveBeenCalled();
  });
});
