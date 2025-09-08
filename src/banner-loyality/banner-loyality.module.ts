import { Module } from '@nestjs/common';
import { BannerLoyalityService } from './banner-loyality.service';
import { BannerLoyalityController } from './banner-loyality.controller';
import { AuthModule } from '@/auth/auth.module';
import { S3Module } from '@/s3/s3.module';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  imports: [S3Module, AuthModule],
  controllers: [BannerLoyalityController],
  providers: [BannerLoyalityService, DatabaseService],
})
export class BannerLoyalityModule {}
