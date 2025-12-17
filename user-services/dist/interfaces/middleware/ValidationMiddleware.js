"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
class ValidationMiddleware {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^\+251\d{9}$/;
        return phoneRegex.test(phoneNumber);
    }
    static validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }
    static validateRegisterRequest(req, res, next) {
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
    static validateLoginRequest(req, res, next) {
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
    static validateRefreshTokenRequest(req, res, next) {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token is required' });
            return;
        }
        next();
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
//# sourceMappingURL=ValidationMiddleware.js.map