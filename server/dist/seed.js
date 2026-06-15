"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCategories = seedCategories;
const Category_1 = require("./models/Category");
const defaultCategories = [
    { name: 'Shopping', slug: 'shopping', icon: 'cart', color: '#FF6B6B' },
    { name: 'Food', slug: 'food', icon: 'fast-food', color: '#4ECDC4' },
    { name: 'Movies', slug: 'movies', icon: 'film', color: '#45B7D1' },
    { name: 'Travel', slug: 'travel', icon: 'airplane', color: '#96CEB4' },
    { name: 'Train', slug: 'train', icon: 'train', color: '#DDA0DD' },
    { name: 'Bus', slug: 'bus', icon: 'bus', color: '#F0E68C' },
    { name: 'Other', slug: 'other', icon: 'gift', color: '#D3D3D3' },
];
async function seedCategories() {
    for (const cat of defaultCategories) {
        const exists = await Category_1.Category.findOne({ slug: cat.slug });
        if (!exists) {
            await Category_1.Category.create(cat);
            console.log(`  Seeded category: ${cat.name}`);
        }
    }
}
//# sourceMappingURL=seed.js.map