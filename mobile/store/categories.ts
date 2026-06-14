import { create } from 'zustand';
import client from '../api/client';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  color?: string;
}

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  categories: [],
  isLoading: false,
  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const { data } = await client.get('/categories');
      set({ categories: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
