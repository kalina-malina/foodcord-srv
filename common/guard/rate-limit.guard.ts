import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}
  private getRealIp(request: any): string {
    const realIp =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.headers['x-client-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown';
    if (realIp.startsWith('::ffff:')) {
      return realIp.substring(7);
    }
    return realIp;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = this.getRealIp(request);
    const endpoint = request.route?.path || 'unknown';
    const key = `rate_limit:${ip}:${endpoint}`;
    const current = await this.redisService.get(key);
    const currentCount = current ? parseInt(current.toString()) : 0;

    if (currentCount >= 50) {
      throw new HttpException(
        'Слишком много запросов. Попробуйте через минуту.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const newCount = currentCount + 1;
    await this.redisService.setTtl(key, newCount.toString(), 60);
    return true;
  }
}
