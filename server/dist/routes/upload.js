"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../controllers/upload");
const auth_1 = require("../middleware/auth");
const upload_2 = require("../middleware/upload");
const router = (0, express_1.Router)();
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
router.post('/', auth_1.authenticate, upload_2.upload.array('images', 5), upload_1.uploadImages);
exports.default = router;
//# sourceMappingURL=upload.js.map