import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { connectSlack, slackCallback, disconnectSlack } from '../controllers/slack.controller';

const router = Router();

router.get('/connect', requireAuth, connectSlack);
router.get('/callback', slackCallback); // Callback doesn't requireAuth middleware because the state contains userId
router.delete('/disconnect', requireAuth, disconnectSlack);

export default router;
