
import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Create a new order
router.post('/', OrderController.createOrder);

// Get available orders (for couriers)
router.get('/available', OrderController.getAvailableOrders);

// Get my orders (or assigned orders for couriers)
router.get('/my-orders', OrderController.getMyOrders);

// Get order by ID
router.get('/:id', OrderController.getOrderById);

// Assign courier
router.patch('/:id/assign', OrderController.assignCourier);

// Update order status
router.patch('/:id/status', OrderController.updateOrderStatus);

export default router;
