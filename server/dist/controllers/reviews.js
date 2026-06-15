"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.getUserReviews = getUserReviews;
const Review_1 = require("../models/Review");
async function createReview(req, res) {
    try {
        const { reviewee, order, rating, comment } = req.body;
        const existing = await Review_1.Review.findOne({ reviewer: req.userId, order });
        if (existing) {
            return res.status(400).json({ message: 'Already reviewed this order' });
        }
        const review = await Review_1.Review.create({
            reviewer: req.userId,
            reviewee,
            order,
            rating,
            comment,
        });
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function getUserReviews(req, res) {
    try {
        const reviews = await Review_1.Review.find({ reviewee: req.params.userId })
            .populate('reviewer', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=reviews.js.map