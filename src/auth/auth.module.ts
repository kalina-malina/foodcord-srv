import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { ConfigModule } from '@nestjs/config';
import { JwtHelper } from './utils/jwt.helpers';
import { CookieAuth } from './utils/cookie.helpers';
import { JwtAuthGuard } from './guards/auth.guard';
import { RedisModule } from 'configs/redis/redis.module';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [AuthService, JwtHelper, CookieAuth, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtHelper, JwtAuthGuard, CookieAuth],
})
export class AuthModule {}
