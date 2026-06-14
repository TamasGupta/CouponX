import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviews';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/user/:userId', getUserReviews);

export default router;
