
import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';

const router = Router();

// Process a payment
router.post('/pay', PaymentController.processPayment);

// Get payment status
router.get('/:orderId', PaymentController.getPaymentStatus);

export default router;
