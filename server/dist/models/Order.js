"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    offer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Offer', required: true },
    buyer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['free', 'paid'], required: true },
    amount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
    couponCode: { type: String },
    paymentId: { type: String },
}, { timestamps: true });
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map