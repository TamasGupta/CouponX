"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = require("../controllers/categories");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all active categories
 *     responses:
 *       200:
 *         description: Categories list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, icon]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               icon: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Slug already exists
 *       401:
 *         description: Unauthorized
 */
/**
 * @openapi
 * /categories/search:
 *   get:
 *     tags: [Categories]
 *     summary: Search categories (DB + Wikipedia suggestions)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, minLength: 2 }
 *     responses:
 *       200:
 *         description: Search suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       slug: { type: string }
 *                       icon: { type: string }
 *                       source: { type: string, enum: [db, web] }
 */
router.get('/', categories_1.listCategories);
router.get('/search', categories_1.searchCategories);
router.post('/', auth_1.authenticate, categories_1.createCategory);
exports.default = router;
//# sourceMappingURL=categories.js.map