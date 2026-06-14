import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviews';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for an order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviewee, order, rating]
 *             properties:
 *               reviewee: { type: string }
 *               order: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Already reviewed this order
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /reviews/user/{userId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Review' }
 */

router.post('/', authenticate, createReview);
router.get('/user/:userId', getUserReviews);

export default router;
