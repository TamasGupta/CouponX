"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = require("../controllers/chat");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
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
router.post('/conversations', auth_1.authenticate, chat_1.createConversation);
router.get('/conversations', auth_1.authenticate, chat_1.getConversations);
router.get('/conversations/:id/messages', auth_1.authenticate, chat_1.getMessages);
router.post('/conversations/:id/messages', auth_1.authenticate, chat_1.sendMessage);
exports.default = router;
//# sourceMappingURL=chat.js.map