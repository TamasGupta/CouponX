export const categories = [
  { id: 'swiggy', label: 'Swiggy', icon: 'fast-food' },
  { id: 'flipkart', label: 'Flipkart', icon: 'cart' },
  { id: 'myntra', label: 'Myntra', icon: 'shirt' },
  { id: 'movie', label: 'Movies', icon: 'film' },
  { id: 'train', label: 'Trains', icon: 'train' },
  { id: 'bus', label: 'Buses', icon: 'bus' },
  { id: 'other', label: 'Other', icon: 'gift' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];
