import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtHelper } from './utils/jwt.helpers';
import { LoginDtoAuthJWT } from './dto/auth.dto';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { CookieAuth } from './utils/cookie.helpers';
import { randomBytes } from 'crypto';
import { RedisSessionService } from './session/redis.session.service';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtHelper: JwtHelper,
    @Inject('DB_AUTH') private readonly pool: Pool,
    private readonly cookieAuth: CookieAuth,
    private readonly redisSession: RedisSessionService,
  ) {}

  async login(dto: LoginDtoAuthJWT, req: Request, res: Response) {
    const login = dto.email.toLowerCase().trim();
    const result = await this.pool.query(
      `
      SELECT id as "idUser", password_hash as hash
      FROM
          users
      WHERE
          locked = false AND
          LOWER(email) = LOWER($1)
      `,
      [login],
    );

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
    await this.redisSession.getUserSessionsAndLimit(user.idUser, 2);

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
      10,
      'minutes',
    );

    await this.redisSession.setSession(
      sid,
      {
        userId: user.idUser,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        divase: device,
        createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      3 * 24 * 60 * 60,
    );
    res.status(200).json({
      auth: true,
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
    await this.cookieAuth.removeCookie(response, 'accessToken');
    await this.cookieAuth.removeCookie(response, 'sid');
    return;
  }
}
