import mongoose from 'mongoose';

export interface IBanner extends mongoose.Document {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new mongoose.Schema<IBanner>(
  {
    image: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    link: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
