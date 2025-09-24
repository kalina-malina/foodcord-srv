import { Module } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { ProductTypeController } from './product-type.controller';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from '@/s3/s3.module';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';

@Module({
  imports: [AuthModule, S3Module, ConfigModule, DatabaseModule],
  controllers: [ProductTypeController],
  providers: [ProductTypeService],
})
export class ProductTypeModule {}
