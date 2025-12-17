"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTProvider = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
class JWTProvider {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
            expiresIn: env_1.config.jwtAccessExpiration,
        });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
            expiresIn: env_1.config.jwtRefreshExpiration,
        });
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    }
}
exports.JWTProvider = JWTProvider;
//# sourceMappingURL=JWTProvider.js.map