import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtHelper } from '../utils/jwt.helpers';

import { CookieAuth } from '../utils/cookie.helpers';

import { RedisSessionService } from '../session/redis.session.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtHelper: JwtHelper,
    private readonly cookieAuth: CookieAuth,
    private readonly redisSession: RedisSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const accessToken = request.cookies?.access_token;

      const payload = await this.jwtHelper.verifyAccessToken(accessToken);
      if (payload) {
        request.user = {
          idUser: payload.idUser,
        };
        return true;
      }
      const session = await this.redisSession.getSession(request.cookies?.sid);
      if (!session) {
        throw new UnauthorizedException({
          auth: false,
          message: 'Сессия не существует или была удалена',
        });
      }

      const refresh_decode: { idUser: number } | null =
        await this.jwtHelper.verifyRefreshToken(request.cookies?.sid);
      if (!refresh_decode) {
        throw new UnauthorizedException({
          auth: false,
          message: 'Истек срок действия refreshToken',
        });
      } else {
        const accessToken: string = await this.jwtHelper.getAccessToken({
          session: request.cookies?.sid,
          idUser: refresh_decode.idUser,
        });
        await this.cookieAuth.setCookie(
          res,
          'access_token',
          accessToken,
          0.5,
          'minutes',
        );
        request.user = {
          idUser: refresh_decode.idUser,
        };
        return true;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        auth: false,
        message: `Ошибка валидации токена ${error}`,
      });
    }
  }
}
