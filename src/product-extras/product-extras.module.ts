import { Module } from '@nestjs/common';

import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { AuthModule } from '@/auth/auth.module';
import { ProductExtrasController } from './product-extras.controller';
import { ProductExtrasService } from './product-extras.service';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';
import { S3Module } from '@/s3/s3.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, S3Module, ConfigModule, DatabaseModule],
  controllers: [ProductExtrasController],
  providers: [ProductExtrasService, DatabaseService],
})
export class ProductExtrasModule {}
