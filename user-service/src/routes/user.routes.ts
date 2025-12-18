
import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(authenticate);

// User profile routes
router.get('/me', UserController.getProfile);
router.put('/me', UserController.updateProfile);
router.delete('/me', UserController.deleteAccount);

// Admin routes
router.get('/', authorize(['ADMIN']), UserController.getAllUsers);
router.get('/:id', authorize(['ADMIN']), UserController.getUserById);
router.patch('/:id/role', authorize(['ADMIN']), UserController.updateUserRole);

export default router;

