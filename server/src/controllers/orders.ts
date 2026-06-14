import { Response } from 'express';
import { Order } from '../models/Order';
import { Offer } from '../models/Offer';
import { AuthRequest } from '../middleware/auth';

export async function createOrder(req: AuthRequest, res: Response) {
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
      return res.status(400).json({ message: 'Cannot claim your own offer' });
    }

    const existingOrder = await Order.findOne({ offer: offerId, buyer: req.userId });
    if (existingOrder) {
      return res.status(400).json({ message: 'Already claimed this offer' });
    }

    const order = await Order.create({
      offer: offerId,
      buyer: req.userId,
      seller: offer.seller,
      type: offer.sellingPrice === 0 ? 'free' : 'paid',
      amount: offer.sellingPrice,
      status: 'pending',
    });

    offer.status = 'claimed';
    await offer.save();

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    const [bought, sold] = await Promise.all([
      Order.find({ buyer: req.userId })
        .populate({ path: 'offer', populate: { path: 'seller', select: 'name avatar' } })
        .sort({ createdAt: -1 }),
      Order.find({ seller: req.userId })
        .populate({ path: 'offer', populate: { path: 'buyer', select: 'name avatar' } })
        .sort({ createdAt: -1 }),
    ]);

    res.json({ bought, sold });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${order.status} to ${status}` });
    }

    if (status === 'cancelled' && order.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only seller can cancel' });
    }

    order.status = status;
    await order.save();

    if (status === 'cancelled') {
      await Offer.findByIdAndUpdate(order.offer, { status: 'active' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
