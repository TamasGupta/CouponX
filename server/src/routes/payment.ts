import { Router } from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/payment';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /payments/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create a Razorpay order for a paid offer
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [offerId]
 *             properties:
 *               offerId: { type: string }
 *     responses:
 *       200:
 *         description: Razorpay order created
 *       400:
 *         description: Offer not available or free
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify a Razorpay payment signature
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpayOrderId, razorpayPaymentId, razorpaySignature]
 *             properties:
 *               razorpayOrderId: { type: string }
 *               razorpayPaymentId: { type: string }
 *               razorpaySignature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Invalid signature
 *       401:
 *         description: Unauthorized
 */

router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyPayment);

export default router;
