import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

let io: Server;

export function setupSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);

    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      'message:send',
      async (data: { conversationId: string; text: string }) => {
        try {
          const conversation = await Conversation.findById(data.conversationId);
          if (!conversation) return;
          if (!conversation.participants.some((p) => p.toString() === userId)) return;

          const message = await Message.create({
            conversation: data.conversationId,
            sender: userId,
            text: data.text,
          });

          conversation.lastMessage = data.text;
          conversation.lastMessageAt = new Date();
          await conversation.save();

          const populated = await message.populate('sender', 'name avatar');

          io.to(`conversation:${data.conversationId}`).emit('message:new', populated);

          conversation.participants.forEach((p) => {
            if (p.toString() !== userId) {
              io.to(`user:${p}`).emit('notification:new', {
                type: 'message',
                title: 'New message',
                body: data.text,
              });
            }
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
