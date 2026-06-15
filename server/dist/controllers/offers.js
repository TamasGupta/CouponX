"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOffers = listOffers;
exports.getOffer = getOffer;
exports.createOffer = createOffer;
exports.updateOffer = updateOffer;
exports.deleteOffer = deleteOffer;
exports.myOffers = myOffers;
const Offer_1 = require("../models/Offer");
async function listOffers(req, res) {
    try {
        const { category, minPrice, maxPrice, search, status } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (status)
            filter.status = status;
        else
            filter.status = 'active';
        if (minPrice || maxPrice) {
            filter.sellingPrice = {};
            if (minPrice)
                filter.sellingPrice.$gte = Number(minPrice);
            if (maxPrice)
                filter.sellingPrice.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$text = { $search: search };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [offers, total] = await Promise.all([
            Offer_1.Offer.find(filter)
                .populate('seller', 'name avatar location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Offer_1.Offer.countDocuments(filter),
        ]);
        res.json({ offers, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function getOffer(req, res) {
    try {
        const offer = await Offer_1.Offer.findById(req.params.id).populate('seller', 'name avatar location');
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.json(offer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function createOffer(req, res) {
    try {
        const { title, description, originalPrice, sellingPrice, couponCode, expiryDate, category, images } = req.body;
        if (!couponCode?.trim()) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }
        const offer = await Offer_1.Offer.create({
            title,
            description,
            originalPrice,
            sellingPrice,
            couponCode: couponCode.trim(),
            expiryDate,
            category,
            images: images || [],
            seller: req.userId,
        });
        res.status(201).json(offer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function updateOffer(req, res) {
    try {
        const offer = await Offer_1.Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        if (offer.seller.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const updates = req.body;
        delete updates.seller;
        delete updates.status;
        Object.assign(offer, updates);
        await offer.save();
        res.json(offer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function deleteOffer(req, res) {
    try {
        const offer = await Offer_1.Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        if (offer.seller.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await offer.deleteOne();
        res.json({ message: 'Offer deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function myOffers(req, res) {
    try {
        const offers = await Offer_1.Offer.find({ seller: req.userId }).sort({ createdAt: -1 });
        res.json(offers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=offers.js.map