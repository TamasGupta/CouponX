"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBanners = listBanners;
exports.createBanner = createBanner;
const Banner_1 = require("../models/Banner");
async function listBanners(_req, res) {
    try {
        const banners = await Banner_1.Banner.find({ active: true }).sort({ order: 1 });
        res.json(banners);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function createBanner(req, res) {
    try {
        const { image, title, subtitle, link, order } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'image is required' });
        }
        const banner = await Banner_1.Banner.create({ image, title, subtitle, link, order });
        res.status(201).json(banner);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=banners.js.map