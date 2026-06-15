"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    reviewer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });
exports.Review = mongoose_1.default.model('Review', reviewSchema);
//# sourceMappingURL=Review.js.map