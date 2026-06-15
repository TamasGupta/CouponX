"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.googleLogin = googleLogin;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/tokeninfo';
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_SECRET, { expiresIn: '7d' });
}
async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const user = await User_1.User.create({ name, email, password });
        const token = generateToken(user._id.toString());
        res.status(201).json({
            token,
            user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id.toString());
        res.json({
            token,
            user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function googleLogin(req, res) {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: 'idToken is required' });
        }
        const verifyRes = await fetch(`${GOOGLE_TOKEN_URL}?id_token=${idToken}`);
        if (!verifyRes.ok) {
            return res.status(401).json({ message: 'Invalid Google token' });
        }
        const payload = await verifyRes.json();
        if (env_1.env.GOOGLE_CLIENT_ID && payload.aud !== env_1.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ message: 'Token audience mismatch' });
        }
        const { sub: googleId, email, name, picture } = payload;
        let user = await User_1.User.findOne({ $or: [{ googleId }, { email }] });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                if (picture && !user.avatar)
                    user.avatar = picture;
                await user.save();
            }
        }
        else {
            user = await User_1.User.create({
                name: name || email.split('@')[0],
                email,
                googleId,
                avatar: picture,
            });
        }
        const token = generateToken(user._id.toString());
        res.json({
            token,
            user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function getProfile(req, res) {
    try {
        const user = await User_1.User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function updateProfile(req, res) {
    try {
        const updates = {};
        const { name, phone, location } = req.body;
        if (name)
            updates.name = name;
        if (phone)
            updates.phone = phone;
        if (location)
            updates.location = location;
        const user = await User_1.User.findByIdAndUpdate(req.userId, updates, {
            new: true,
            runValidators: true,
        }).select('-password');
        res.json({ id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=auth.js.map