import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import moment from 'moment';

@Injectable()
export class CookieAuth {
  constructor(private readonly configService: ConfigService) {}

  async setCookie(
    response: Response,
    name: string,
    value: string,
    time: number,
    unit: 'minutes' | 'days' = 'minutes',
  ) {
    let maxAge: number;
    if (unit === 'days') {
      maxAge = time * 24 * 60 * 60 * 1000; // дни в миллисекунды
    } else {
      maxAge = time * 60 * 1000; // минуты в миллисекунды
    }
    response.cookie(name, value, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });
    const expiresDate = moment().add(time, unit);
    return expiresDate.format('YYYY-MM-DD HH:mm:ss');
  }

  async removeCookie(response: Response, name: string) {
    response.cookie(name, '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}
