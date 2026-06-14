import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const TOKEN_KEY = 'couponx_token';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  isReady: false,

  loadStoredToken: async () => {
    const stored = await AsyncStorage.getItem(TOKEN_KEY);
    if (stored) set({ token: stored, isReady: true });
    else set({ isReady: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await client.post('/auth/login', { email, password });
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      set({ token: data.token, user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await client.post('/auth/register', { name, email, password });
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      set({ token: data.token, user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  loadUser: async () => {
    if (!get().token) return;
    try {
      const { data } = await client.get('/auth/me');
      set({ user: data });
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null });
    }
  },
}));
