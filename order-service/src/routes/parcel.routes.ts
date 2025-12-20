import { Router } from 'express';
import * as ParcelController from '../controllers/parcel.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:parcel_id', ParcelController.getParcelById);
router.put('/:parcel_id', ParcelController.updateParcel);
router.delete('/:parcel_id', ParcelController.deleteParcel);

export default router;
