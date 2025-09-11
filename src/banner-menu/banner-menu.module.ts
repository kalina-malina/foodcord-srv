import { Module } from '@nestjs/common';
import { BannerMenuService } from './banner-menu.service';

import { AuthModule } from '@/auth/auth.module';
import { BannerMenuController } from './banner-menu.controller';
import { S3Module } from '@/s3/s3.module';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  imports: [S3Module, AuthModule],
  controllers: [BannerMenuController],
  providers: [BannerMenuService, DatabaseService],
})
export class BannerMenuModule {}
