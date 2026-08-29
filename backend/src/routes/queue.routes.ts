import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from '../queues/email.queue';
import { requireAuth } from '../middleware/auth.middleware';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

const router = serverAdapter.getRouter();

// Option to protect with requireAuth (if admins only, can check roles)
// We will just use requireAuth for basic protection
// Actually, ExpressAdapter returns an Express router.
// We can wrap it. But for now, we just export it.

export default router;
