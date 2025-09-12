import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisSessionService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  async setSession(
    sessionId: string,
    userData: any,
    refreshTokenExpiresIn: string,
  ): Promise<void> {
    const ttlSeconds = this.convertJwtTimeToSeconds(refreshTokenExpiresIn);

    await this.redisClient.setEx(
      `sess:${sessionId}`,
      ttlSeconds,
      JSON.stringify(userData),
    );
  }

  private convertJwtTimeToSeconds(jwtTime: string): number {
    const timeValue = parseInt(jwtTime);
    const timeUnit = jwtTime.replace(timeValue.toString(), '');

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      case 'w':
        return timeValue * 7 * 24 * 60 * 60;
      case 'y':
        return timeValue * 365 * 24 * 60 * 60;
      default:
        return parseInt(jwtTime);
    }
  }

  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.redisClient.get(`sess:${sessionId}`);

    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisClient.del(`sess:${sessionId}`);
  }

  async updateSessionTTL(
    sessionId: string,
    ttl: number = 86400,
  ): Promise<void> {
    await this.redisClient.expire(`sess:${sessionId}`, ttl);
  }

  async getUserSessionsAndLimit(
    userId: number,
    maxSessions: number = 2,
  ): Promise<string[]> {
    const keys = await this.redisClient.keys(`sess:*`);
    const sessions = [];

    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        const sessionData = JSON.parse(data);
        if (sessionData.userId === userId) {
          sessions.push({
            sessionId: key.replace('sess:', ''),
            createdAt: new Date(sessionData.createAt || 0),
            device: sessionData.divase || 'Unknown',
          });
        }
      }
    }

    if (sessions.length >= maxSessions) {
      sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const sessionsToDelete = sessions.slice(
        0,
        sessions.length - maxSessions + 1,
      );
      for (const session of sessionsToDelete) {
        await this.deleteSession(session.sessionId);
      }
      return sessions.slice(sessionsToDelete.length).map((s) => s.sessionId);
    }
    return sessions.map((s) => s.sessionId);
  }
}
