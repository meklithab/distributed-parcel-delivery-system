"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const JWTProvider_1 = require("../../infrastructure/security/JWTProvider");
class AuthMiddleware {
    static authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Access token required' });
                return;
            }
            const token = authHeader.substring(7);
            try {
                const decoded = JWTProvider_1.JWTProvider.verifyToken(token);
                req.user = {
                    userId: decoded.userId,
                    userRole: decoded.userRole
                };
                next();
            }
            catch (error) {
                res.status(401).json({ error: 'Invalid or expired token' });
                return;
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Authentication failed' });
        }
    }
    static authorizeRoles(...roles) {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            if (!roles.includes(req.user.userRole)) {
                res.status(403).json({ error: 'Insufficient permissions' });
                return;
            }
            next();
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map