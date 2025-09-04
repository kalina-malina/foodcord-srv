import { Injectable } from '@nestjs/common';
import { CreateBannerLoyalityDto } from './dto/create-banner-loyality.dto';
import { UpdateBannerLoyalityDto } from './dto/update-banner-loyality.dto';

@Injectable()
export class BannerLoyalityService {
  create(createBannerLoyalityDto: CreateBannerLoyalityDto) {
    void createBannerLoyalityDto;
    return 'This action adds a new bannerLoyality';
  }

  findAll() {
    return `This action returns all bannerLoyality`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bannerLoyality`;
  }

  update(id: number, updateBannerLoyalityDto: UpdateBannerLoyalityDto) {
    void updateBannerLoyalityDto;
    return `This action updates a #${id} bannerLoyality`;
  }

  remove(id: number) {
    return `This action removes a #${id} bannerLoyality`;
  }
}
