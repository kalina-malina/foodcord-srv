import { Module } from '@nestjs/common';
import { BannerTvService } from './banner-tv.service';
import { BannerTvController } from './banner-tv.controller';
import { S3Module } from '@/s3/s3.module';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  imports: [AuthModule, S3Module],
  controllers: [BannerTvController],
  providers: [BannerTvService, DatabaseService],
})
export class BannerTvModule {}
