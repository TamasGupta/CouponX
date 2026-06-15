import mongoose from 'mongoose';
export interface IOrder extends mongoose.Document {
    offer: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    type: 'free' | 'paid';
    amount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    couponCode?: string;
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map