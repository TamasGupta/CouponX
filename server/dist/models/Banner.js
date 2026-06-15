"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    image: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    link: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });
exports.Banner = mongoose_1.default.model('Banner', bannerSchema);
//# sourceMappingURL=Banner.js.map