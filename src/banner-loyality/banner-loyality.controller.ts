import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BannerLoyalityService } from './banner-loyality.service';
import { CreateBannerLoyalityDto } from './dto/create-banner-loyality.dto';
import { UpdateBannerLoyalityDto } from './dto/update-banner-loyality.dto';

@Controller('banner-loyality')
export class BannerLoyalityController {
  constructor(private readonly bannerLoyalityService: BannerLoyalityService) {}

  @Post()
  create(@Body() createBannerLoyalityDto: CreateBannerLoyalityDto) {
    return this.bannerLoyalityService.create(createBannerLoyalityDto);
  }

  @Get()
  findAll() {
    return this.bannerLoyalityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerLoyalityService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBannerLoyalityDto: UpdateBannerLoyalityDto,
  ) {
    return this.bannerLoyalityService.update(+id, updateBannerLoyalityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannerLoyalityService.remove(+id);
  }
}
