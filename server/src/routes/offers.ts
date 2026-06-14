import { Router } from 'express';
import { listOffers, getOffer, createOffer, updateOffer, deleteOffer, myOffers } from '../controllers/offers';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', listOffers);
router.get('/my', authenticate, myOffers);
router.get('/:id', getOffer);
router.post('/', authenticate, createOffer);
router.put('/:id', authenticate, updateOffer);
router.delete('/:id', authenticate, deleteOffer);

export default router;
