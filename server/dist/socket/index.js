"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
let io;
function setupSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        socket.join(`user:${userId}`);
        socket.on('join:conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });
        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });
        socket.on('message:send', async (data) => {
            try {
                const conversation = await Conversation_1.Conversation.findById(data.conversationId);
                if (!conversation)
                    return;
                if (!conversation.participants.some((p) => p.toString() === userId))
                    return;
                const message = await Message_1.Message.create({
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
            }
            catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        socket.on('disconnect', () => { });
    });
    return io;
}
function getIO() {
    if (!io)
        throw new Error('Socket.io not initialized');
    return io;
}
//# sourceMappingURL=index.js.map