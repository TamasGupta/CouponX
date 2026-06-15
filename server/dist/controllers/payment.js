"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRazorpayOrder = createRazorpayOrder;
exports.verifyPayment = verifyPayment;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const Offer_1 = require("../models/Offer");
const Order_1 = require("../models/Order");
const razorpay = new razorpay_1.default({
    key_id: env_1.env.RAZORPAY.KEY_ID,
    key_secret: env_1.env.RAZORPAY.KEY_SECRET,
});
async function createRazorpayOrder(req, res) {
    try {
        const { offerId } = req.body;
        const offer = await Offer_1.Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        if (offer.status !== 'active') {
            return res.status(400).json({ message: 'Offer is not available' });
        }
        if (offer.seller.toString() === req.userId) {
            return res.status(400).json({ message: 'Cannot buy your own offer' });
        }
        const existingOrder = await Order_1.Order.findOne({ offer: offerId, buyer: req.userId });
        if (existingOrder) {
            return res.status(400).json({ message: 'Already claimed this offer' });
        }
        if (offer.sellingPrice <= 0) {
            return res.status(400).json({ message: 'Free offers do not require payment' });
        }
        const amountInPaise = Math.round(offer.sellingPrice * 100);
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `of_${offerId.toString().slice(-16)}_${Date.now()}`,
            notes: {
                offerId: offerId.toString(),
                buyerId: req.userId,
            },
        });
        const populated = await Offer_1.Offer.findById(offerId).populate('seller', 'name');
        const sellerName = populated?.seller?.name || 'Seller';
        res.json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: env_1.env.RAZORPAY.KEY_ID,
            offerTitle: offer.title,
            sellerName,
        });
    }
    catch (error) {
        console.error('Create Razorpay order failed', {
            error: error.error?.description || error.error || error.message,
            statusCode: error.statusCode,
        });
        res.status(500).json({ message: error.error?.description || error.error || error.message || 'Payment initiation failed' });
    }
}
async function verifyPayment(req, res) {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: 'Missing payment verification fields' });
        }
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', env_1.env.RAZORPAY.KEY_SECRET)
            .update(body)
            .digest('hex');
        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        const payment = await razorpay.payments.fetch(razorpayPaymentId);
        res.json({
            verified: true,
            payment: {
                id: payment.id,
                order_id: payment.order_id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
            },
        });
    }
    catch (error) {
        console.error('Payment verification failed', {
            error: error.error?.description || error.error || error.message,
            statusCode: error.statusCode,
        });
        res.status(500).json({ message: error.error?.description || error.error || error.message || 'Payment verification failed' });
    }
}
//# sourceMappingURL=payment.js.map