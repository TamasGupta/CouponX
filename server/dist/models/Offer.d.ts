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
export declare const Offer: mongoose.Model<IOffer, {}, {}, {}, mongoose.Document<unknown, {}, IOffer, {}, {}> & IOffer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Offer.d.ts.map