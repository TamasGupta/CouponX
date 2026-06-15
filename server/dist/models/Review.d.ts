import mongoose from 'mongoose';
export interface IReview extends mongoose.Document {
    reviewer: mongoose.Types.ObjectId;
    reviewee: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
}
export declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Review.d.ts.map