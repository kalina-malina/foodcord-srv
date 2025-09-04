import { Injectable } from '@nestjs/common';
import { CreateBannerMenuDto } from './dto/create-banner-menu.dto';
import { UpdateBannerMenuDto } from './dto/update-banner-menu.dto';

@Injectable()
export class BannerMenuService {
  create(createBannerMenuDto: CreateBannerMenuDto) {
    void createBannerMenuDto;
    return 'This action adds a new bannerMenu';
  }

  findAll() {
    return `This action returns all bannerMenu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bannerMenu`;
  }

  update(id: number, updateBannerMenuDto: UpdateBannerMenuDto) {
    void updateBannerMenuDto;
    return `This action updates a #${id} bannerMenu`;
  }

  remove(id: number) {
    return `This action removes a #${id} bannerMenu`;
  }
}
