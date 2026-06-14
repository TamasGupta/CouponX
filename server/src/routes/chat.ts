import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chat';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post('/conversations/:id/messages', authenticate, sendMessage);

export default router;
