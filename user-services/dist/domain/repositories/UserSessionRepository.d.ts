import { UserSession } from '../entities/UserSession';
export interface UserSessionRepository {
    create(session: UserSession): Promise<UserSession>;
    findByRefreshTokenHash(refreshTokenHash: string): Promise<UserSession | null>;
    findByUserId(userId: string): Promise<UserSession[]>;
    deleteBySessionId(sessionId: string): Promise<void>;
    deleteExpiredSessions(): Promise<void>;
}
//# sourceMappingURL=UserSessionRepository.d.ts.map