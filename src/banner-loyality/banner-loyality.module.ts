import { Module } from '@nestjs/common';
import { BannerLoyalityService } from './banner-loyality.service';
import { BannerLoyalityController } from './banner-loyality.controller';

@Module({
  controllers: [BannerLoyalityController],
  providers: [BannerLoyalityService],
})
export class BannerLoyalityModule {}
