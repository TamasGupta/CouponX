"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = createConversation;
exports.getConversations = getConversations;
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
async function createConversation(req, res) {
    try {
        const { participantId } = req.body;
        if (!participantId) {
            return res.status(400).json({ message: 'participantId is required' });
        }
        if (participantId === req.userId) {
            return res.status(400).json({ message: 'Cannot start conversation with yourself' });
        }
        let conversation = await Conversation_1.Conversation.findOne({
            participants: { $all: [req.userId, participantId], $size: 2 },
        });
        if (!conversation) {
            conversation = await Conversation_1.Conversation.create({
                participants: [req.userId, participantId],
            });
        }
        await conversation.populate('participants', 'name avatar');
        res.json(conversation);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function getConversations(req, res) {
    try {
        const conversations = await Conversation_1.Conversation.find({
            participants: req.userId,
        })
            .populate('participants', 'name avatar')
            .sort({ lastMessageAt: -1 });
        res.json(conversations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function getMessages(req, res) {
    try {
        const conversation = await Conversation_1.Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (!conversation.participants.some((p) => p.toString() === req.userId)) {
            return res.status(403).json({ message: 'Not a participant' });
        }
        const messages = await Message_1.Message.find({ conversation: req.params.id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function sendMessage(req, res) {
    try {
        const { text } = req.body;
        const conversationId = req.params.id;
        const conversation = await Conversation_1.Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (!conversation.participants.some((p) => p.toString() === req.userId)) {
            return res.status(403).json({ message: 'Not a participant' });
        }
        const message = await Message_1.Message.create({
            conversation: conversationId,
            sender: req.userId,
            text,
        });
        conversation.lastMessage = text;
        conversation.lastMessageAt = new Date();
        await conversation.save();
        const populated = await message.populate('sender', 'name avatar');
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=chat.js.map