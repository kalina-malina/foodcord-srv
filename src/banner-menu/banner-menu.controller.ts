import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerUniversalOptions } from '@/s3/multer.config';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { BannerMenuService } from './banner-menu.service';
import { CreateBannerMenuDto } from './dto/create-banner-menu.dto';
import { UpdateBannerMenuDto } from './dto/update-banner-menu.dto';

@ApiTags('Баннеры стартового экрана')
@Controller('banner-menu')
export class BannerMenuController {
  constructor(private readonly bannerMainService: BannerMenuService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBannerMenuDto })
  @ApiOperation({ summary: 'Создание нового баннера меню' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  create(
    @Body() createBannerMainDto: CreateBannerMenuDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createBannerMainDto.file = file;
    }
    return this.bannerMainService.create(createBannerMainDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Получение списка всех баннеров меню' })
  findAll() {
    return this.bannerMainService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Получение баннера меню по ID' })
  findOne(@Param('id') id: string) {
    return this.bannerMainService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBannerMenuDto })
  @ApiOperation({ summary: 'Обновление баннера меню' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  update(
    @Param('id') id: string,
    @Body() updateBannerMainDto: UpdateBannerMenuDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateBannerMainDto.file = file;
    }
    return this.bannerMainService.update(+id, updateBannerMainDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление баннера меню' })
  remove(@Param('id') id: string) {
    return this.bannerMainService.remove(+id);
  }
}
