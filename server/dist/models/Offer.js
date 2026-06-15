"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const offerSchema = new mongoose_1.default.Schema({
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
    seller: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['active', 'claimed', 'expired'],
        default: 'active',
    },
}, { timestamps: true });
offerSchema.index({ category: 1, status: 1, createdAt: -1 });
offerSchema.index({ title: 'text', description: 'text' });
exports.Offer = mongoose_1.default.model('Offer', offerSchema);
//# sourceMappingURL=Offer.js.map