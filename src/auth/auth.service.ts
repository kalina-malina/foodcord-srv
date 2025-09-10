import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtHelper } from './utils/jwt.helpers';
import { LoginDtoAuthJWT } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { CookieAuth } from './utils/cookie.helpers';
import { randomBytes } from 'crypto';
import { RedisSessionService } from './session/redis.session.service';
import moment from 'moment';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { USER_ROLE } from '@/role/enum/role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtHelper: JwtHelper,
    private readonly databaseService: DatabaseService,
    private readonly cookieAuth: CookieAuth,
    private readonly redisSession: RedisSessionService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDtoAuthJWT, req: Request, res: Response) {
    const login = dto.email.toLowerCase().trim();
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `
      SELECT id as "idUser", password_hash as hash
      FROM
          users
      WHERE
          locked = false AND
          LOWER(email) = LOWER($1)
      `,
      params: [login],
    });

    if (result.rows.length === 0) {
      throw new NotFoundException({
        auth: false,
        message: 'Пользователь не зарегистрирован',
      });
    }

    const user = result.rows[0];

    if (!(await bcrypt.compare(dto.password, user.hash))) {
      throw new UnauthorizedException({
        auth: false,
        message: 'Не верный пароль',
      });
    }
    const maxSessions = this.configService.getOrThrow('MAX_SESSIONS');
    if (!maxSessions) {
      throw new BadRequestException(
        'Походу на сервере критическая ошибка в настройках',
      );
    }
    await this.redisSession.getUserSessionsAndLimit(user.idUser, maxSessions);

    const device = req.useragent?.isMobile
      ? 'Mobile'
      : req.useragent?.isTablet
        ? 'Tablet'
        : req.useragent?.isDesktop
          ? 'Desktop'
          : 'Unknown';

    const accessToken: string = await this.jwtHelper.getAccessToken({
      idUser: user.idUser,
    });

    const refreshToken: string = await this.jwtHelper.getRefreshToken({
      idUser: user.idUser,
    });

    const sid = randomBytes(32).toString('hex');

    // Используем тот же срок жизни что и у refresh токена
    const refreshTokenTTL =
      this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';

    await this.cookieAuth.setCookie(
      res,
      'access_token',
      accessToken,
      1,
      'minutes',
    );
    const expiresAt = await this.cookieAuth.setCookie(
      res,
      'sid',
      sid,
      refreshTokenTTL,
    );

    await this.redisSession.setSession(
      sid,
      {
        userId: +user.idUser,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        divase: device,
        createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      refreshTokenTTL, // Теперь Redis сессия живет столько же сколько refresh token!
    );
    res.status(200).json({
      auth: true,
      role: USER_ROLE.ADMIN,
      store: { idStore: 1, name: 'Молодежный 2' },
    });
  }

  async logout(request: Request, response: Response) {
    const sid = request.cookies?.sid;
    if (!sid) {
      throw new UnauthorizedException({
        auth: false,
        message: 'Не авторизован',
      });
    }
    await this.redisSession.deleteSession(sid);
    await this.cookieAuth.removeCookie(response, 'access_token');
    await this.cookieAuth.removeCookie(response, 'sid');
    return;
  }
}
