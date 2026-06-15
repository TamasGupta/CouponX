import mongoose from 'mongoose';
export interface IMessage extends mongoose.Document {
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    text?: string;
    image?: string;
    createdAt: Date;
}
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Message.d.ts.map