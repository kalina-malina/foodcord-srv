import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvPath } from '@/env-path.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from '@/redis/redis.module';

import { SetDatabaseModule } from '@/pg-connect/set/pg.module';
import { PgModule } from '@/pg-connect/foodcord/pg.module';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';
import { ProductOriginslModule } from './product-original/product.module';
import { ProductCronModule } from './product-original/cron/update-product-cron.module';
import { GroupOriginalModule } from './group-original/group-original.module';
import { ProductMainModule } from './product-main/product-main.module';
import { BannerMainModule } from './banner-main/banner-main.module';
import { BannerLoyalityModule } from './banner-loyality/banner-loyality.module';
import { BannerMenuModule } from './banner-menu/banner-menu.module';
import { GroupsModule } from './groups/groups.module';
import { ProductExtrasModule } from './product-extras/product-extras.module';
import { GroupsSubModule } from './groups-sub/groups-sub.module';
import { ProductTypeModule } from './product-type/product-type.module';
import { StoresModule } from './stores/stores.module';
import { ProductIngridientsModule } from './product-ingridients/product-ingridients.module';
import { OrdersModule } from './orders/orders.module';

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
    UsersModule,
    GroupOriginalModule,
    GroupsSubModule,
    GroupsModule,
    ProductMainModule,
    ProductExtrasModule,
    ProductTypeModule,
    ProductOriginslModule,
    ProductCronModule,
    BannerMainModule,
    BannerLoyalityModule,
    BannerMenuModule,
    StoresModule,
    ProductIngridientsModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
