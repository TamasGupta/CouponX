import { create } from 'zustand';
import client from '../api/client';

export interface Offer {
  _id: string;
  title: string;
  description: string;
  originalPrice?: number;
  sellingPrice: number;
  expiryDate?: string;
  category: string;
  images: string[];
  seller: { _id: string; name: string; avatar?: string; location?: { city: string } };
  status: 'active' | 'claimed' | 'expired';
  createdAt: string;
}

interface OffersState {
  offers: Offer[];
  total: number;
  page: number;
  isLoading: boolean;
  fetchOffers: (params?: Record<string, any>) => Promise<void>;
  fetchMore: () => Promise<void>;
  reset: () => void;
}

export const useOffersStore = create<OffersState>((set, get) => ({
  offers: [],
  total: 0,
  page: 1,
  isLoading: false,

  fetchOffers: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await client.get('/offers', { params: { ...params, page: 1 } });
      set({ offers: data.offers, total: data.total, page: 1 });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMore: async () => {
    const { page, offers, total, isLoading } = get();
    if (isLoading || offers.length >= total) return;
    set({ isLoading: true });
    try {
      const { data } = await client.get('/offers', { params: { page: page + 1 } });
      set({ offers: [...offers, ...data.offers], page: page + 1 });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ offers: [], total: 0, page: 1 }),
}));
