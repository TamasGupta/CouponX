"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const offers_1 = require("../controllers/offers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /offers:
 *   get:
 *     tags: [Offers]
 *     summary: List offers with filters
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers: { type: array, items: { $ref: '#/components/schemas/Offer' } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 totalPages: { type: integer }
 *   post:
 *     tags: [Offers]
 *     summary: Create a new offer
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, sellingPrice, category]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               originalPrice: { type: number }
 *               sellingPrice: { type: number }
 *               expiryDate: { type: string, format: date }
 *               category: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Offer created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Offer' }
 *       401:
 *         description: Unauthorized
 */
/**
 * @openapi
 * /offers/my:
 *   get:
 *     tags: [Offers]
 *     summary: Get current user's offers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User's offers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Offer' }
 */
/**
 * @openapi
 * /offers/{id}:
 *   get:
 *     tags: [Offers]
 *     summary: Get offer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Offer details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Offer' }
 *       404:
 *         description: Offer not found
 *   put:
 *     tags: [Offers]
 *     summary: Update own offer
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               originalPrice: { type: number }
 *               sellingPrice: { type: number }
 *               expiryDate: { type: string, format: date }
 *               category: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Offer updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Offer' }
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Offer not found
 *   delete:
 *     tags: [Offers]
 *     summary: Delete own offer
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Offer deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Offer not found
 */
router.get('/', offers_1.listOffers);
router.get('/my', auth_1.authenticate, offers_1.myOffers);
router.get('/:id', offers_1.getOffer);
router.post('/', auth_1.authenticate, offers_1.createOffer);
router.put('/:id', auth_1.authenticate, offers_1.updateOffer);
router.delete('/:id', auth_1.authenticate, offers_1.deleteOffer);
exports.default = router;
//# sourceMappingURL=offers.js.map