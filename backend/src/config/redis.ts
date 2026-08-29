import Redis from 'ioredis';
import { config } from './env';

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
