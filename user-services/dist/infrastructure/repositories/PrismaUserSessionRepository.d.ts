import { UserSession } from '../../domain/entities/UserSession';
import { UserSessionRepository } from '../../domain/repositories/UserSessionRepository';
export declare class PrismaUserSessionRepository implements UserSessionRepository {
    create(session: UserSession): Promise<UserSession>;
    findByRefreshTokenHash(refreshTokenHash: string): Promise<UserSession | null>;
    findByUserId(userId: string): Promise<UserSession[]>;
    deleteBySessionId(sessionId: string): Promise<void>;
    deleteExpiredSessions(): Promise<void>;
    private mapToDomain;
}
//# sourceMappingURL=PrismaUserSessionRepository.d.ts.map