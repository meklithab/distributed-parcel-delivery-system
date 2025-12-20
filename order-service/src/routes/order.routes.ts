import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import * as AddressController from '../controllers/order-address.controller';
import * as ParcelController from '../controllers/parcel.controller';
import * as TrackingController from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// --- Order Endpoints ---
router.post('/', OrderController.createOrder);
router.get('/', OrderController.listOrders);
router.get('/:id', OrderController.getOrderById);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

// --- Address Endpoints (Nested) ---
router.post('/:order_id/addresses', AddressController.createAddress);
router.get('/:order_id/addresses', AddressController.listAddresses);
router.get('/:order_id/addresses/:address_id', AddressController.getAddressById);
router.put('/:order_id/addresses/:address_id', AddressController.updateAddress);
router.delete('/:order_id/addresses/:address_id', AddressController.deleteAddress);

// --- Parcel Endpoints (Nested) ---
router.post('/:order_id/parcels', ParcelController.createParcel);
router.get('/:order_id/parcels', ParcelController.listParcels);

// --- Tracking Endpoints (Nested) ---
router.post('/:order_id/tracking', TrackingController.createTrackingEvent);
router.get('/:order_id/tracking', TrackingController.listTrackingEvents);

export default router;
