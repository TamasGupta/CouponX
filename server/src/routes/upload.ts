import { Router } from 'express';
import { uploadImages } from '../controllers/upload';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload images to Cloudinary
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Uploaded image URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls: { type: array, items: { type: string } }
 *       401:
 *         description: Unauthorized
 */

router.post('/', authenticate, upload.array('images', 5), uploadImages);

export default router;
