"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banners_1 = require("../controllers/banners");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /banners:
 *   get:
 *     tags: [Banners]
 *     summary: List active banners sorted by order
 *     responses:
 *       200:
 *         description: Banners list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Banner' }
 *   post:
 *     tags: [Banners]
 *     summary: Create a banner
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string }
 *               title: { type: string }
 *               subtitle: { type: string }
 *               link: { type: string }
 *               order: { type: integer, default: 0 }
 *     responses:
 *       201:
 *         description: Banner created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Banner' }
 *       400:
 *         description: Image is required
 *       401:
 *         description: Unauthorized
 */
router.get('/', banners_1.listBanners);
router.post('/', auth_1.authenticate, banners_1.createBanner);
exports.default = router;
//# sourceMappingURL=banners.js.map