import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { EnvPath } from 'configs/env-path.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';

import { RedisModule } from 'configs/redis/redis.module';
import { ProductService } from './product/product.service';
import { ProductModule } from './product/product.module';
import { SetDatabaseModule } from 'configs/pg-connect/set/pg.module';
import { PgModule } from 'configs/pg-connect/foodcord/pg.module';
import { DatabaseModule } from 'configs/pg-connect/foodcord/orm/grud-postgres.module';

@Module({
  imports: [
    EnvPath,
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    PgModule,
    DatabaseModule,
    SetDatabaseModule,
    AuthModule,
    RoleModule,
    RoleModule,
    UsersModule,
    ProductModule,
  ],
  controllers: [],
  providers: [ProductService],
  exports: [],
})
export class AppModule {}
