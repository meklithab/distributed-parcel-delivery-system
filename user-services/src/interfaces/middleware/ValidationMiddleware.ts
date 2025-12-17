import { Request, Response, NextFunction } from 'express';

export class ValidationMiddleware {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Ethiopian phone number format: +251 followed by 9 digits
    const phoneRegex = /^\+251\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  static validatePassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static validateRegisterRequest(req: Request, res: Response, next: NextFunction) {
    const { email, phoneNumber, password, firstName, lastName } = req.body;

    if (!email || !phoneNumber || !password || !firstName || !lastName) {
      res.status(400).json({ 
        error: 'Missing required fields: email, phoneNumber, password, firstName, lastName' 
      });
      return;
    }

    if (!ValidationMiddleware.validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!ValidationMiddleware.validatePhoneNumber(phoneNumber)) {
      res.status(400).json({ error: 'Invalid phone number format. Use +251 format.' });
      return;
    }

    if (!ValidationMiddleware.validatePassword(password)) {
      res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      });
      return;
    }

    next();
  }

  static validateLoginRequest(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (!ValidationMiddleware.validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    next();
  }

  static validateRefreshTokenRequest(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    next();
  }
}