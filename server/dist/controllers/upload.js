"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = uploadImages;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
cloudinary_1.v2.config({
    cloud_name: env_1.env.CLOUDINARY.CLOUD_NAME,
    api_key: env_1.env.CLOUDINARY.API_KEY,
    api_secret: env_1.env.CLOUDINARY.API_SECRET,
});
async function uploadImages(req, res) {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files provided' });
        }
        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'couponx' }, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result.secure_url);
                });
                stream.end(file.buffer);
            });
        });
        const urls = await Promise.all(uploadPromises);
        res.json({ urls });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Upload failed' });
    }
}
//# sourceMappingURL=upload.js.map