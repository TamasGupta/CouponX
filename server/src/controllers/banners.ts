import { Request, Response } from 'express';
import { Banner } from '../models/Banner';

export async function listBanners(_req: Request, res: Response) {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createBanner(req: Request, res: Response) {
  try {
    const { image, title, subtitle, link, order } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'image is required' });
    }
    const banner = await Banner.create({ image, title, subtitle, link, order });
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
