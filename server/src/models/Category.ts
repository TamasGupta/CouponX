import mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
  name: string;
  slug: string;
  icon: string;
  image?: string;
  color?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    icon: { type: String, required: true },
    image: { type: String },
    color: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
