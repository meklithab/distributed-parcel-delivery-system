"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const PasswordHasher_1 = require("../../infrastructure/security/PasswordHasher");
const JWTProvider_1 = require("../../infrastructure/security/JWTProvider");
const UserRole_1 = require("../../domain/enums/UserRole");
const uuid_1 = require("uuid");
class AuthService {
    constructor(userRepository, userSessionRepository) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
    }
    async register(dto) {
        const existingUserEmail = await this.userRepository.findByEmail(dto.email);
        if (existingUserEmail) {
            throw new Error('User with this email already exists');
        }
        const existingUserPhone = await this.userRepository.findByPhoneNumber(dto.phoneNumber);
        if (existingUserPhone) {
            throw new Error('User with this phone number already exists');
        }
        const passwordHash = await PasswordHasher_1.PasswordHasher.hashPassword(dto.password);
        const newUser = {
            userId: (0, uuid_1.v4)(),
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            passwordHash: passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            dateOfBirth: dto.dateOfBirth,
            userRole: UserRole_1.UserRole.CUSTOMER,
            isActive: true,
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const createdUser = await this.userRepository.create(newUser);
        return this.generateAuthResponse(createdUser);
    }
    async login(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await PasswordHasher_1.PasswordHasher.comparePassword(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        if (!user.isActive) {
            throw new Error('User account is inactive');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.update(user);
        return this.generateAuthResponse(user);
    }
    async refresh(dto) {
        let decoded;
        try {
            decoded = JWTProvider_1.JWTProvider.verifyToken(dto.refreshToken);
        }
        catch (e) {
            throw new Error('Invalid refresh token');
        }
        const refreshTokenHash = await PasswordHasher_1.PasswordHasher.hashPassword(dto.refreshToken);
        const session = await this.userSessionRepository.findByRefreshTokenHash(this.hashToken(dto.refreshToken));
        if (!session) {
            throw new Error('Invalid session');
        }
        if (session.expiresAt < new Date()) {
            await this.userSessionRepository.deleteBySessionId(session.sessionId);
            throw new Error('Session expired');
        }
        const accessToken = JWTProvider_1.JWTProvider.generateAccessToken({
            userId: session.userId,
            userRole: decoded.userRole,
        });
        return { accessToken };
    }
    async logout(dto) {
        const hash = this.hashToken(dto.refreshToken);
        const session = await this.userSessionRepository.findByRefreshTokenHash(hash);
        if (session) {
            await this.userSessionRepository.deleteBySessionId(session.sessionId);
        }
    }
    async generateAuthResponse(user) {
        const payload = {
            userId: user.userId,
            userRole: user.userRole,
        };
        const accessToken = JWTProvider_1.JWTProvider.generateAccessToken(payload);
        const refreshToken = JWTProvider_1.JWTProvider.generateRefreshToken(payload);
        const session = {
            sessionId: (0, uuid_1.v4)(),
            userId: user.userId,
            accessTokenHash: this.hashToken(accessToken),
            refreshTokenHash: this.hashToken(refreshToken),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            lastActivityAt: new Date(),
        };
        await this.userSessionRepository.create(session);
        return {
            accessToken,
            refreshToken,
            user: {
                userId: user.userId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userRole: user.userRole,
            },
        };
    }
    hashToken(token) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map