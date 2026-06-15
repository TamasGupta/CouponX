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
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Category.d.ts.map