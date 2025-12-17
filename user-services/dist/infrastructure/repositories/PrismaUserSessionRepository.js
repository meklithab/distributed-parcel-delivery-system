"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserSessionRepository = void 0;
const prismaClient_1 = __importDefault(require("../database/prismaClient"));
class PrismaUserSessionRepository {
    async create(session) {
        const createdSession = await prismaClient_1.default.userSession.create({
            data: {
                session_id: session.sessionId,
                user_id: session.userId,
                device_id: session.deviceId,
                device_type: session.deviceType,
                access_token_hash: session.accessTokenHash,
                refresh_token_hash: session.refreshTokenHash,
                expires_at: session.expiresAt,
                created_at: session.createdAt,
                last_activity_at: session.lastActivityAt,
            },
        });
        return this.mapToDomain(createdSession);
    }
    async findByRefreshTokenHash(refreshTokenHash) {
        const session = await prismaClient_1.default.userSession.findUnique({
            where: { refresh_token_hash: refreshTokenHash },
        });
        return session ? this.mapToDomain(session) : null;
    }
    async findByUserId(userId) {
        const sessions = await prismaClient_1.default.userSession.findMany({
            where: { user_id: userId },
        });
        return sessions.map((s) => this.mapToDomain(s));
    }
    async deleteBySessionId(sessionId) {
        await prismaClient_1.default.userSession.delete({
            where: { session_id: sessionId },
        });
    }
    async deleteExpiredSessions() {
        await prismaClient_1.default.userSession.deleteMany({
            where: {
                expires_at: {
                    lt: new Date(),
                },
            },
        });
    }
    mapToDomain(prismaSession) {
        return {
            sessionId: prismaSession.session_id,
            userId: prismaSession.user_id,
            deviceId: prismaSession.device_id,
            deviceType: prismaSession.device_type,
            accessTokenHash: prismaSession.access_token_hash,
            refreshTokenHash: prismaSession.refresh_token_hash,
            expiresAt: prismaSession.expires_at,
            createdAt: prismaSession.created_at,
            lastActivityAt: prismaSession.last_activity_at,
        };
    }
}
exports.PrismaUserSessionRepository = PrismaUserSessionRepository;
//# sourceMappingURL=PrismaUserSessionRepository.js.map