import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { scheduleEmails, getScheduledEmails, getSentEmails, searchEmailEndpoint } from '../controllers/email.controller';

const router = Router();

router.use(requireAuth);

router.post('/schedule', scheduleEmails);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.get('/search', searchEmailEndpoint);

export default router;
