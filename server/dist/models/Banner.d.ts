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
export declare const Banner: mongoose.Model<IBanner, {}, {}, {}, mongoose.Document<unknown, {}, IBanner, {}, {}> & IBanner & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Banner.d.ts.map