import { Response } from 'express';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';

const WIKI_API = 'https://en.wikipedia.org/w/api.php?action=opensearch&limit=8&namespace=0&format=json';

export async function listCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function searchCategories(req: AuthRequest, res: Response) {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const dbResults = await Category.find({
      active: true,
      name: { $regex: q, $options: 'i' },
    }).sort({ name: 1 }).limit(8);

    const dbNames = new Set(dbResults.map((c) => c.name.toLowerCase()));
    const suggestions = dbResults.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, source: 'db' }));

    try {
      const wikiRes = await fetch(`${WIKI_API}&search=${encodeURIComponent(q)}`);
      const wikiData = await wikiRes.json();
      const wikiNames: string[] = wikiData[1] || [];
      for (const name of wikiNames) {
        if (!dbNames.has(name.toLowerCase())) {
          suggestions.push({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), icon: 'pricetag', source: 'web' });
        }
      }
    } catch {}

    res.json({ suggestions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, slug, icon } = req.body;
    if (!name || !slug || !icon) {
      return res.status(400).json({ message: 'name, slug and icon are required' });
    }
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    const category = await Category.create({ name, slug, icon });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
