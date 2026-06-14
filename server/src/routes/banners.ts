import { Router } from 'express';
import { listBanners, createBanner } from '../controllers/banners';
import { authenticate } from '../middleware/auth';

const router = Router();

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

router.get('/', listBanners);
router.post('/', authenticate, createBanner);

export default router;
