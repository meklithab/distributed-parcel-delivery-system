
import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Create a new order
router.post('/', OrderController.createOrder);

// Get my orders
router.get('/my-orders', OrderController.getMyOrders);

// Get order by ID
router.get('/:id', OrderController.getOrderById);

export default router;
