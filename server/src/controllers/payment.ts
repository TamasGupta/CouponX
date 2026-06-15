import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import { Offer } from '../models/Offer';
import { Order } from '../models/Order';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY.KEY_ID,
  key_secret: env.RAZORPAY.KEY_SECRET,
});

export async function createRazorpayOrder(req: AuthRequest, res: Response) {
  try {
    const { offerId } = req.body;
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.status !== 'active') {
      return res.status(400).json({ message: 'Offer is not available' });
    }
    if (offer.seller.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot buy your own offer' });
    }

    const existingOrder = await Order.findOne({ offer: offerId, buyer: req.userId });
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
        buyerId: req.userId!,
      },
    });

    const populated = await Offer.findById(offerId).populate('seller', 'name');
    const sellerName = (populated?.seller as any)?.name || 'Seller';

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: env.RAZORPAY.KEY_ID,
      offerTitle: offer.title,
      sellerName,
    });
  } catch (error: any) {
    console.error('Create Razorpay order failed', {
      error: error.error?.description || error.error || error.message,
      statusCode: error.statusCode,
    });
    res.status(500).json({ message: error.error?.description || error.error || error.message || 'Payment initiation failed' });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY.KEY_SECRET)
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
  } catch (error: any) {
    console.error('Payment verification failed', {
      error: error.error?.description || error.error || error.message,
      statusCode: error.statusCode,
    });
    res.status(500).json({ message: error.error?.description || error.error || error.message || 'Payment verification failed' });
  }
}
