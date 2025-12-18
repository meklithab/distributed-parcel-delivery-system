
import { Router } from 'express';
import * as AddressController from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Address management routes
router.get('/', AddressController.getUserAddresses);
router.post('/', AddressController.addAddress);
router.put('/:addressId', AddressController.updateAddress);
router.delete('/:addressId', AddressController.deleteAddress);
router.patch('/:addressId/default', AddressController.setDefaultAddress);

export default router;
