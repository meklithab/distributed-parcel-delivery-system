import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../../application/services/UserService';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { PrismaCourierProfileRepository } from '../../infrastructure/repositories/PrismaCourierProfileRepository';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { UserRole } from '../../domain/enums/UserRole';

const router = Router();

// Initialize dependencies
const userRepository = new PrismaUserRepository();
const courierProfileRepository = new PrismaCourierProfileRepository();
const userService = new UserService(userRepository, courierProfileRepository);
const userController = new UserController(userService);

// Apply authentication middleware to all routes
router.use(AuthMiddleware.authenticate);

// Courier routes
router.post('/profile', AuthMiddleware.authorizeRoles(UserRole.COURIER), (req, res) => userController.createCourierProfile(req, res));
router.patch('/availability', AuthMiddleware.authorizeRoles(UserRole.COURIER), (req, res) => userController.updateCourierAvailability(req, res));
router.get('/me', AuthMiddleware.authorizeRoles(UserRole.COURIER), (req, res) => userController.getMyCourierProfile(req, res));

export default router;
