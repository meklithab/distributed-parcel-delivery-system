
import { Router } from 'express';
import { body } from 'express-validator';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

// Validation Rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone_number').notEmpty().withMessage('Phone number is required'),
  body('user_role').optional().isIn(['CUSTOMER', 'COURIER']).withMessage('Invalid role')
];

// Routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', AuthController.login);

export default router;
