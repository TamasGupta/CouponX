import mongoose from 'mongoose';

export interface IOffer extends mongoose.Document {
  title: string;
  description: string;
  originalPrice?: number;
  sellingPrice: number;
  couponCode: string;
  expiryDate?: Date;
  category: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  status: 'active' | 'claimed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new mongoose.Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    originalPrice: { type: Number },
    sellingPrice: { type: Number, required: true, default: 0 },
    couponCode: { type: String, required: true },
    expiryDate: { type: Date },
    category: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'claimed', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
);

offerSchema.index({ category: 1, status: 1, createdAt: -1 });
offerSchema.index({ title: 'text', description: 'text' });

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);
