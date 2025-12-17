export interface UserSession {
  sessionId: string;
  userId: string;
  deviceId?: string;
  deviceType?: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}