import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { RedisSessionService } from '../session/redis.session.service';

@Injectable()
export class JwtHelper {
  private readonly secret: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly redisSession: RedisSessionService,
  ) {
    this.secret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  async getAccessToken(payload: object): Promise<string> {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  async getRefreshToken(payload: object): Promise<string> {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async verifyRefreshToken(sid: string): Promise<{ idUser: number } | null> {
    try {
      if (!sid) {
        return null;
      }
      const session = await this.redisSession.getSession(sid);

      if (!session) {
        return null;
      }

      const decoded = jwt.verify(
        session.refreshToken,
        this.secret,
      ) as JwtPayload;

      return { idUser: decoded.idUser };
    } catch {
      return null;
    }
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<{ idUser: number; session: number } | null> {
    try {
      const decoded = jwt.verify(accessToken, this.secret) as JwtPayload;
      return { idUser: decoded.idUser, session: decoded.session };
    } catch {
      return null;
    }
  }
}
