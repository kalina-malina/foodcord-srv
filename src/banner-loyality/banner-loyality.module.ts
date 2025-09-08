import { Module } from '@nestjs/common';
import { BannerLoyalityService } from './banner-loyality.service';
import { BannerLoyalityController } from './banner-loyality.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BannerLoyalityController],
  providers: [BannerLoyalityService],
})
export class BannerLoyalityModule {}
