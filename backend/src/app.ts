import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import { config } from './config/env';

// Route imports
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import slackRoutes from './routes/slack.routes';
import queueRoutes from './routes/queue.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Trust Render / Cloudflare reverse proxy headers for HTTPS cookie handling
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedFrontend = config.frontendUrl.replace(/\/$/, '');
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (normalizedOrigin === normalizedFrontend || normalizedOrigin.includes('onrender.com') || normalizedOrigin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: [config.sessionSecret],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  httpOnly: true,
}));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/slack', slackRoutes);
app.use('/admin/queues', queueRoutes);

app.use(errorHandler);

export default app;
