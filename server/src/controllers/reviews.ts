import { Response } from 'express';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/auth';

export async function createReview(req: AuthRequest, res: Response) {
  try {
    const { reviewee, order, rating, comment } = req.body;

    const existing = await Review.findOne({ reviewer: req.userId, order });
    if (existing) {
      return res.status(400).json({ message: 'Already reviewed this order' });
    }

    const review = await Review.create({
      reviewer: req.userId,
      reviewee,
      order,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserReviews(req: AuthRequest, res: Response) {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
