import { UserSession } from '../../domain/entities/UserSession';
import { UserSessionRepository } from '../../domain/repositories/UserSessionRepository';
import prisma from '../database/prismaClient';

export class PrismaUserSessionRepository implements UserSessionRepository {
  async create(session: UserSession): Promise<UserSession> {
    const createdSession = await prisma.userSession.create({
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

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<UserSession | null> {
    const session = await prisma.userSession.findUnique({
      where: { refresh_token_hash: refreshTokenHash },
    });
    return session ? this.mapToDomain(session) : null;
  }

  async findByUserId(userId: string): Promise<UserSession[]> {
    const sessions = await prisma.userSession.findMany({
      where: { user_id: userId },
    });
    return sessions.map((s) => this.mapToDomain(s));
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await prisma.userSession.delete({
      where: { session_id: sessionId },
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await prisma.userSession.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }

  private mapToDomain(prismaSession: any): UserSession {
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
