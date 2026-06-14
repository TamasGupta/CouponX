import { Response } from 'express';
import { Offer } from '../models/Offer';
import { AuthRequest } from '../middleware/auth';

export async function listOffers(req: AuthRequest, res: Response) {
  try {
    const { category, minPrice, maxPrice, search, status } = req.query;
    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'active';
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search as string };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      Offer.find(filter)
        .populate('seller', 'name avatar location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Offer.countDocuments(filter),
    ]);

    res.json({ offers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getOffer(req: AuthRequest, res: Response) {
  try {
    const offer = await Offer.findById(req.params.id).populate('seller', 'name avatar location');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(offer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createOffer(req: AuthRequest, res: Response) {
  try {
    const { title, description, originalPrice, sellingPrice, expiryDate, category, images } =
      req.body;

    const offer = await Offer.create({
      title,
      description,
      originalPrice,
      sellingPrice,
      expiryDate,
      category,
      images: images || [],
      seller: req.userId,
    });

    res.status(201).json(offer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateOffer(req: AuthRequest, res: Response) {
  try {
    const offer = await Offer.findById(req.params.id);
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteOffer(req: AuthRequest, res: Response) {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    if (offer.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await offer.deleteOne();
    res.json({ message: 'Offer deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function myOffers(req: AuthRequest, res: Response) {
  try {
    const offers = await Offer.find({ seller: req.userId }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
