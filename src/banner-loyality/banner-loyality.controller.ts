import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BannerLoyalityService } from './banner-loyality.service';
import { CreateBannerLoyalityDto } from './dto/create-banner-loyality.dto';

import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerUniversalOptions } from '@/s3/multer.config';
import { UpdateBannerLoyalityDto } from './dto/update-banner-loyality.dto';

@Controller('banner-loyality')
@ApiTags('Баннеры страницы ввода номера телефона лояльности')
@UseGuards(JwtAuthGuard)
export class BannerLoyalityController {
  constructor(private readonly bannerLoyalityService: BannerLoyalityService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBannerLoyalityDto })
  @ApiOperation({
    summary: 'Создание нового баннера, страница ввода номера телефона',
  })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  create(
    @Body() createBannerLoyalityDto: CreateBannerLoyalityDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createBannerLoyalityDto.file = file;
    }
    return this.bannerLoyalityService.create(createBannerLoyalityDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получение списка всех баннеров, страница ввода номера телефона',
  })
  findAll() {
    return this.bannerLoyalityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение баннера по ID' })
  findOne(@Param('id') id: string) {
    return this.bannerLoyalityService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBannerLoyalityDto })
  @ApiOperation({ summary: 'Обновление баннера' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  update(
    @Param('id') id: string,
    @Body() updateBannerLoyalityDto: UpdateBannerLoyalityDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateBannerLoyalityDto.file = file;
    }
    return this.bannerLoyalityService.update(+id, updateBannerLoyalityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление баннера, страница ввода номера телефона' })
  remove(@Param('id') id: string) {
    return this.bannerLoyalityService.remove(+id);
  }
}
