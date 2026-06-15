"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_1 = require("../controllers/orders");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Claim an offer (create order)
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
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Offer not available or already claimed
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Orders]
 *     summary: Get my orders (bought & sold)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bought: { type: array, items: { $ref: '#/components/schemas/Order' } }
 *                 sold: { type: array, items: { $ref: '#/components/schemas/Order' } }
 */
/**
 * @openapi
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.post('/', auth_1.authenticate, orders_1.createOrder);
router.get('/', auth_1.authenticate, orders_1.getMyOrders);
router.put('/:id/status', auth_1.authenticate, orders_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map