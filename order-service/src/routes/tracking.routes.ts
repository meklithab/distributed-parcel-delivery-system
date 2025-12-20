import { Router } from 'express';
import * as TrackingController from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:event_id', TrackingController.getTrackingEventById);

export default router;
