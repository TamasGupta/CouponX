import { Router } from 'express';
import { createOrder, getMyOrders, updateOrderStatus } from '../controllers/orders';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.put('/:id/status', authenticate, updateOrderStatus);

export default router;
