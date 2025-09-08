import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { ConfigModule } from '@nestjs/config';
import { JwtHelper } from './utils/jwt.helpers';
import { CookieAuth } from './utils/cookie.helpers';
import { JwtAuthGuard } from './guards/auth.guard';
import { RedisModule } from '@/redis/redis.module';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';

@Module({
  imports: [ConfigModule, RedisModule, DatabaseModule],
  providers: [AuthService, JwtHelper, CookieAuth, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtHelper, JwtAuthGuard, CookieAuth],
})
export class AuthModule {}
