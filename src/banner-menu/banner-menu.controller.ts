import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BannerMenuService } from './banner-menu.service';
import { CreateBannerMenuDto } from './dto/create-banner-menu.dto';
import { UpdateBannerMenuDto } from './dto/update-banner-menu.dto';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('banner-menu')
@ApiTags('Баннеры меню')
@UseGuards(JwtAuthGuard)
export class BannerMenuController {
  constructor(private readonly bannerMenuService: BannerMenuService) {}

  @Post()
  create(@Body() createBannerMenuDto: CreateBannerMenuDto) {
    return this.bannerMenuService.create(createBannerMenuDto);
  }

  @Get()
  findAll() {
    return this.bannerMenuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerMenuService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBannerMenuDto: UpdateBannerMenuDto,
  ) {
    return this.bannerMenuService.update(+id, updateBannerMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannerMenuService.remove(+id);
  }
}
