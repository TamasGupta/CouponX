import { Router } from 'express';
import { createConversation, getConversations, getMessages, sendMessage } from '../controllers/chat';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /chat/conversations:
 *   post:
 *     tags: [Chat]
 *     summary: Create or get existing conversation
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId]
 *             properties:
 *               participantId: { type: string }
 *     responses:
 *       200:
 *         description: Conversation (existing or new)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Conversation' }
 *       400:
 *         description: Cannot chat with yourself
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Chat]
 *     summary: List user's conversations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Conversations list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Conversation' }
 */

/**
 * @openapi
 * /chat/conversations/{id}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages in a conversation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 *       403:
 *         description: Not a participant
 *       404:
 *         description: Conversation not found
 *   post:
 *     tags: [Chat]
 *     summary: Send a message
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       403:
 *         description: Not a participant
 *       404:
 *         description: Conversation not found
 */

router.post('/conversations', authenticate, createConversation);
router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post('/conversations/:id/messages', authenticate, sendMessage);

export default router;
