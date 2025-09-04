import { Module } from '@nestjs/common';
import { BannerMainService } from './banner-main.service';
import { BannerMainController } from './banner-main.controller';
import { DatabaseService } from '../../common/pg-connect/foodcord/orm/grud-postgres.service';
import { S3Module } from '@/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [BannerMainController],
  providers: [BannerMainService, DatabaseService],
})
export class BannerMainModule {}
