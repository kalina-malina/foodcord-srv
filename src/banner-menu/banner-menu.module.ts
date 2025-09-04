import { Module } from '@nestjs/common';
import { BannerMenuService } from './banner-menu.service';
import { BannerMenuController } from './banner-menu.controller';

@Module({
  controllers: [BannerMenuController],
  providers: [BannerMenuService],
})
export class BannerMenuModule {}
