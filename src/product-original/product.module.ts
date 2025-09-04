import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProductOriginslController } from './product.controller';
import { ProductOriginslService } from './product.service';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';
import { SetDatabaseModule } from '@/pg-connect/set/pg.module';
import { ProductCronModule } from './cron/update-product-cron.module';
import { S3Module } from '@/s3/s3.module';

@Module({
  imports: [
    ConfigModule,
    SetDatabaseModule,
    ProductCronModule,
    DatabaseModule,
    S3Module,
  ],
  controllers: [ProductOriginslController],
  providers: [ProductOriginslService],
  exports: [DatabaseModule],
})
export class ProductOriginslModule {}
