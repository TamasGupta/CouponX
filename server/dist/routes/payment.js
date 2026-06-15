"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controllers/payment");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
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
router.post('/create-order', auth_1.authenticate, payment_1.createRazorpayOrder);
router.post('/verify', auth_1.authenticate, payment_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=payment.js.map