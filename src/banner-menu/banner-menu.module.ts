import { Module } from '@nestjs/common';
import { BannerMenuService } from './banner-menu.service';
import { BannerMenuController } from './banner-menu.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BannerMenuController],
  providers: [BannerMenuService],
})
export class BannerMenuModule {}
