import { Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';

export async function createConversation(req: AuthRequest, res: Response) {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required' });
    }
    if (participantId === req.userId) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, participantId], $size: 2 },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.userId, participantId],
      });
    }
    await conversation.populate('participants', 'name avatar');
    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getConversations(req: AuthRequest, res: Response) {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate('participants', 'name avatar')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getMessages(req: AuthRequest, res: Response) {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const { text } = req.body;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      text,
    });

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate('sender', 'name avatar');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
