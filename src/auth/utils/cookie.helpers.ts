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
    time: number | string,
    unit: 'minutes' | 'days' = 'minutes',
  ) {
    let maxAge: number;

    // Если передана строка (JWT формат), конвертируем
    if (typeof time === 'string') {
      maxAge = this.convertJwtTimeToMilliseconds(time);
    } else {
      // Старая логика для чисел
      if (unit === 'days') {
        maxAge = time * 24 * 60 * 60 * 1000; // дни в миллисекунды
      } else {
        maxAge = time * 60 * 1000; // минуты в миллисекунды
      }
    }
    response.cookie(name, value, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });
    // Правильно рассчитываем время истечения
    let expiresDate: moment.Moment;
    if (typeof time === 'string') {
      expiresDate = this.addJwtTimeToMoment(moment(), time);
    } else {
      expiresDate = moment().add(time, unit);
    }
    return expiresDate.format('YYYY-MM-DD HH:mm:ss');
  }

  private convertJwtTimeToMilliseconds(jwtTime: string): number {
    const timeValue = parseInt(jwtTime);
    const timeUnit = jwtTime.replace(timeValue.toString(), '');

    switch (timeUnit) {
      case 's':
        return timeValue * 1000;
      case 'm':
        return timeValue * 60 * 1000;
      case 'h':
        return timeValue * 60 * 60 * 1000;
      case 'd':
        return timeValue * 24 * 60 * 60 * 1000;
      case 'w':
        return timeValue * 7 * 24 * 60 * 60 * 1000;
      case 'y':
        return timeValue * 365 * 24 * 60 * 60 * 1000;
      default:
        // Если нет единицы измерения, считаем что это секунды
        return parseInt(jwtTime) * 1000;
    }
  }

  private addJwtTimeToMoment(
    momentObj: moment.Moment,
    jwtTime: string,
  ): moment.Moment {
    const timeValue = parseInt(jwtTime);
    const timeUnit = jwtTime.replace(timeValue.toString(), '');

    switch (timeUnit) {
      case 's':
        return momentObj.add(timeValue, 'seconds');
      case 'm':
        return momentObj.add(timeValue, 'minutes');
      case 'h':
        return momentObj.add(timeValue, 'hours');
      case 'd':
        return momentObj.add(timeValue, 'days');
      case 'w':
        return momentObj.add(timeValue, 'weeks');
      case 'y':
        return momentObj.add(timeValue, 'years');
      default:
        // Если нет единицы измерения, считаем что это секунды
        return momentObj.add(parseInt(jwtTime), 'seconds');
    }
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
