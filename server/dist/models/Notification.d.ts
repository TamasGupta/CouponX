import mongoose from 'mongoose';
export interface INotification extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map