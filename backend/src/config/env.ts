import * as dotenv from 'dotenv';
dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
};

export const config = {
  port: parseInt(getEnv('PORT', '5000'), 10),
  frontendUrl: getEnv('FRONTEND_URL'),
  backendUrl: getEnv('BACKEND_URL'),
  sessionSecret: getEnv('SESSION_SECRET'),
  
  databaseUrl: getEnv('DATABASE_URL'),
  redisUrl: getEnv('REDIS_URL'),
  elasticsearchUrl: getEnv('ELASTICSEARCH_URL'),
  
  google: {
    clientId: getEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    callbackUrl: getEnv('GOOGLE_CALLBACK_URL'),
  },
  
  slack: {
    clientId: getEnv('SLACK_CLIENT_ID'),
    clientSecret: getEnv('SLACK_CLIENT_SECRET'),
    redirectUri: getEnv('SLACK_REDIRECT_URI'),
  },
  
  smtp: {
    host: getEnv('SMTP_HOST'),
    port: parseInt(getEnv('SMTP_PORT', '587'), 10),
    user: getEnv('SMTP_USER'),
    pass: getEnv('SMTP_PASS'),
  },
  
  limits: {
    maxEmailsPerHour: parseInt(getEnv('MAX_EMAILS_PER_HOUR', '100'), 10),
    minDelayBetweenEmails: parseInt(getEnv('MIN_DELAY_BETWEEN_EMAILS', '2'), 10),
    workerConcurrency: parseInt(getEnv('WORKER_CONCURRENCY', '5'), 10),
  }
};
