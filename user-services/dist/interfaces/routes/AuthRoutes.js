"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const AuthService_1 = require("../../application/services/AuthService");
const PrismaUserRepository_1 = require("../../infrastructure/repositories/PrismaUserRepository");
const PrismaUserSessionRepository_1 = require("../../infrastructure/repositories/PrismaUserSessionRepository");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const router = (0, express_1.Router)();
const userRepository = new PrismaUserRepository_1.PrismaUserRepository();
const userSessionRepository = new PrismaUserSessionRepository_1.PrismaUserSessionRepository();
const authService = new AuthService_1.AuthService(userRepository, userSessionRepository);
const authController = new AuthController_1.AuthController(authService);
router.post('/register', ValidationMiddleware_1.ValidationMiddleware.validateRegisterRequest, (req, res) => authController.register(req, res));
router.post('/login', ValidationMiddleware_1.ValidationMiddleware.validateLoginRequest, (req, res) => authController.login(req, res));
router.post('/refresh', ValidationMiddleware_1.ValidationMiddleware.validateRefreshTokenRequest, (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map