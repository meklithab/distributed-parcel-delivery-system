
import { Router } from 'express';
import * as RatingController from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Submit a rating for a courier
router.post('/', RatingController.submitCourierRating);

// Get ratings for a specific courier
router.get('/courier/:courierId', RatingController.getCourierRatings);

// Get my submitted ratings
router.get('/my-ratings', RatingController.getMyRatings);

export default router;
