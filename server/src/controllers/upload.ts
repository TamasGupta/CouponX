import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export async function uploadImages(req: AuthRequest, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    const uploadPromises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'couponx' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result!.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);
    res.json({ urls });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
}
