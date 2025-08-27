import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { EnvPath } from 'configs/env-path.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';
import { ProductModule } from './product/product.module';
import { DatabaseModule } from 'configs/pg-connect/pg.module';
import { RedisModule } from 'configs/redis/redis.module';

@Module({
  imports: [
    EnvPath,
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    DatabaseModule,
    AuthModule,
    RoleModule,
    RoleModule,
    UsersModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
