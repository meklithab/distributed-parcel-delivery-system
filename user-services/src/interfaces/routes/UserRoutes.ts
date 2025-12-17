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

// User profile routes
router.get('/me', (req, res) => userController.getMyProfile(req, res));
router.patch('/me', (req, res) => userController.updateMyProfile(req, res));

// Admin route to get user by ID
router.get('/:id', AuthMiddleware.authorizeRoles(UserRole.ADMIN), (req, res) => userController.getUserById(req, res));

export default router;
