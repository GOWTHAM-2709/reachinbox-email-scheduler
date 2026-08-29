import { Router } from 'express';
import { googleAuth, googleAuthCallback, logout, me } from '../controllers/auth.controller';

const router = Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.post('/logout', logout);
router.get('/me', me);

export default router;
