import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../../application/services/AuthService';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { PrismaUserSessionRepository } from '../../infrastructure/repositories/PrismaUserSessionRepository';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

const router = Router();

// Initialize dependencies
const userRepository = new PrismaUserRepository();
const userSessionRepository = new PrismaUserSessionRepository();
const authService = new AuthService(userRepository, userSessionRepository);
const authController = new AuthController(authService);

// Routes
router.post('/register', ValidationMiddleware.validateRegisterRequest, (req, res) => authController.register(req, res));
router.post('/login', ValidationMiddleware.validateLoginRequest, (req, res) => authController.login(req, res));
router.post('/refresh', ValidationMiddleware.validateRefreshTokenRequest, (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
