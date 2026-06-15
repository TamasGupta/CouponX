"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.searchCategories = searchCategories;
exports.createCategory = createCategory;
const Category_1 = require("../models/Category");
const WIKI_API = 'https://en.wikipedia.org/w/api.php?action=opensearch&limit=8&namespace=0&format=json';
async function listCategories(_req, res) {
    try {
        const categories = await Category_1.Category.find({ active: true }).sort({ name: 1 });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function searchCategories(req, res) {
    try {
        const q = (req.query.q || '').trim();
        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }
        const dbResults = await Category_1.Category.find({
            active: true,
            name: { $regex: q, $options: 'i' },
        }).sort({ name: 1 }).limit(8);
        const dbNames = new Set(dbResults.map((c) => c.name.toLowerCase()));
        const suggestions = dbResults.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, source: 'db' }));
        try {
            const wikiRes = await fetch(`${WIKI_API}&search=${encodeURIComponent(q)}`);
            const wikiData = await wikiRes.json();
            const wikiNames = wikiData[1] || [];
            for (const name of wikiNames) {
                if (!dbNames.has(name.toLowerCase())) {
                    suggestions.push({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), icon: 'pricetag', source: 'web' });
                }
            }
        }
        catch { }
        res.json({ suggestions });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function createCategory(req, res) {
    try {
        const { name, slug, icon } = req.body;
        if (!name || !slug || !icon) {
            return res.status(400).json({ message: 'name, slug and icon are required' });
        }
        const existing = await Category_1.Category.findOne({ slug });
        if (existing) {
            return res.status(400).json({ message: 'Category with this slug already exists' });
        }
        const category = await Category_1.Category.create({ name, slug, icon });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=categories.js.map