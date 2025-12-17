"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(req, res) {
        try {
            const { email, phoneNumber, password, firstName, lastName, dateOfBirth } = req.body;
            const result = await this.authService.register({
                email,
                phoneNumber,
                password,
                firstName,
                lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
            });
            res.status(201).json(result);
        }
        catch (error) {
            if (error.message === 'User with this email already exists' || error.message === 'User with this phone number already exists') {
                res.status(409).json({ error: error.message });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login({
                email,
                password
            });
            res.status(200).json(result);
        }
        catch (error) {
            if (error.message === 'Invalid credentials' || error.message === 'User account is inactive') {
                res.status(401).json({ error: error.message });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refresh({
                refreshToken
            });
            res.status(200).json(result);
        }
        catch (error) {
            if (error.message === 'Invalid refresh token' || error.message === 'Invalid session' || error.message === 'Session expired') {
                res.status(401).json({ error: error.message });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Token refresh failed' });
        }
    }
    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }
            await this.authService.logout({
                refreshToken
            });
            res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map