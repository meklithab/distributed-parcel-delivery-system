
import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Price estimation endpoint (CUSTOMER only) - Get price estimate before creating order
router.post('/estimate-price', authorize(['CUSTOMER']), OrderController.estimatePrice);

// Create a new order (CUSTOMER only)
router.post('/', authorize(['CUSTOMER']), OrderController.createOrder);

// Get all orders (admin/system view - for now, allow all authenticated users)
router.get('/', OrderController.getAllOrders);

// Get customer's own orders (CUSTOMER only)
router.get('/my-orders', authorize(['CUSTOMER']), OrderController.getMyOrders);

// Get courier's assigned orders (COURIER only)
router.get('/courier-orders', authorize(['COURIER']), OrderController.getCourierOrders);

// Get order by ID (accessible by customer who owns it or assigned courier)
router.get('/:id', OrderController.getOrderById);

// Update order status (COURIER only)
router.patch('/:id/status', authorize(['COURIER']), OrderController.updateOrderStatus);

// Cancel an order (CUSTOMER only) - only allowed when not paid or assigned
router.patch('/:id/cancel', authorize(['CUSTOMER']), OrderController.cancelOrder);

// Assign courier to order (for now, allow all - in production, restrict to admin/dispatcher)
router.patch('/:id/assign-courier', OrderController.assignCourier);

export default router;
