"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getMyOrders = getMyOrders;
exports.updateOrderStatus = updateOrderStatus;
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const Order_1 = require("../models/Order");
const Offer_1 = require("../models/Offer");
const env_1 = require("../config/env");
const razorpay = new razorpay_1.default({
    key_id: env_1.env.RAZORPAY.KEY_ID,
    key_secret: env_1.env.RAZORPAY.KEY_SECRET,
});
async function createOrder(req, res) {
    try {
        const { offerId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
        const offer = await Offer_1.Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        if (offer.status !== 'active') {
            return res.status(400).json({ message: 'Offer is not available' });
        }
        if (offer.seller.toString() === req.userId) {
            return res.status(400).json({ message: 'Cannot claim your own offer' });
        }
        const existingOrder = await Order_1.Order.findOne({ offer: offerId, buyer: req.userId });
        if (existingOrder) {
            return res.status(400).json({ message: 'Already claimed this offer' });
        }
        if (offer.sellingPrice > 0) {
            if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
                return res.status(400).json({ message: 'Payment is required for paid offers' });
            }
            const body = razorpayOrderId + '|' + razorpayPaymentId;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', env_1.env.RAZORPAY.KEY_SECRET)
                .update(body)
                .digest('hex');
            if (expectedSignature !== razorpaySignature) {
                console.error('Payment signature mismatch', { razorpayOrderId, razorpayPaymentId, razorpaySignature, expectedSignature });
                return res.status(400).json({ message: 'Payment verification failed' });
            }
            const payment = await razorpay.payments.fetch(razorpayPaymentId);
            console.log('Payment status check', { paymentId: razorpayPaymentId, status: payment.status, method: payment.method });
            if (payment.status === 'failed') {
                return res.status(400).json({ message: 'Payment failed' });
            }
            if (payment.status !== 'captured' && payment.status !== 'authorized') {
                return res.status(400).json({ message: `Unexpected payment status: ${payment.status}` });
            }
        }
        const isPaid = offer.sellingPrice > 0;
        const order = await Order_1.Order.create({
            offer: offerId,
            buyer: req.userId,
            seller: offer.seller,
            type: isPaid ? 'paid' : 'free',
            amount: offer.sellingPrice,
            status: isPaid ? 'confirmed' : 'pending',
            paymentId: razorpayPaymentId || undefined,
            couponCode: isPaid ? offer.couponCode : undefined,
        });
        await Offer_1.Offer.updateOne({ _id: offerId }, { status: 'claimed' });
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Order creation failed', {
            error: error.error?.description || error.error || error.message,
            code: error.code,
            name: error.name,
        });
        res.status(500).json({ message: error.error?.description || error.error || error.message || 'Order creation failed' });
    }
}
async function getMyOrders(req, res) {
    try {
        const [bought, sold] = await Promise.all([
            Order_1.Order.find({ buyer: req.userId })
                .populate({ path: 'offer', populate: { path: 'seller', select: 'name avatar' } })
                .sort({ createdAt: -1 }),
            Order_1.Order.find({ seller: req.userId })
                .populate('offer', 'title sellingPrice images status')
                .populate('buyer', 'name avatar')
                .sort({ createdAt: -1 }),
        ]);
        res.json({ bought, sold });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function updateOrderStatus(req, res) {
    try {
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const { status } = req.body;
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['completed', 'cancelled'],
        };
        if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot transition from ${order.status} to ${status}` });
        }
        if (status === 'cancelled' && order.seller.toString() !== req.userId) {
            return res.status(403).json({ message: 'Only seller can cancel' });
        }
        if (status === 'confirmed') {
            if (order.seller.toString() !== req.userId) {
                return res.status(403).json({ message: 'Only seller can confirm' });
            }
            const offer = await Offer_1.Offer.findById(order.offer);
            if (!offer) {
                return res.status(404).json({ message: 'Offer not found' });
            }
            order.couponCode = offer.couponCode;
        }
        order.status = status;
        await order.save();
        if (status === 'cancelled') {
            await Offer_1.Offer.findByIdAndUpdate(order.offer, { status: 'active' });
        }
        const populated = await Order_1.Order.findById(order._id)
            .populate('offer', 'title sellingPrice images status')
            .populate('buyer', 'name avatar')
            .populate('seller', 'name avatar');
        res.json(populated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=orders.js.map