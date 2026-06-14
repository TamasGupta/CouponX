import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/tokeninfo';

function generateToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req: AuthRequest, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function googleLogin(req: AuthRequest, res: Response) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    const verifyRes = await fetch(`${GOOGLE_TOKEN_URL}?id_token=${idToken}`);
    if (!verifyRes.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload: any = await verifyRes.json();

    if (env.GOOGLE_CLIENT_ID && payload.aud !== env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Token audience mismatch' });
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const updates: Record<string, any> = {};
    const { name, phone, location } = req.body;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (location) updates.location = location;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
