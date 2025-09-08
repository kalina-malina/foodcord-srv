import { Module } from '@nestjs/common';
import { ProductMainService } from './product-main.service';
import { ProductMainController } from './product-main.controller';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';
import { S3Module } from '@/s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [ConfigModule, DatabaseModule, S3Module, AuthModule],
  controllers: [ProductMainController],
  providers: [ProductMainService],
})
export class ProductMainModule {}
