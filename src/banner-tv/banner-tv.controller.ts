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
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannerTvService } from './banner-tv.service';
import { CreateBannerTvDto } from './dto/create-banner-tv.dto';
import { UpdateBannerTvDto } from './dto/update-banner-tv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerUniversalOptions } from '@/s3/multer.config';

@ApiTags('Баннеры TV')
@Controller('banner-tv')
export class BannerTvController {
  constructor(private readonly bannerTvService: BannerTvService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBannerTvDto })
  @ApiOperation({ summary: 'Создание нового баннера TV' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  create(
    @Body() createBannerTvDto: CreateBannerTvDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createBannerTvDto.file = file;
    }
    return this.bannerTvService.create(createBannerTvDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка всех баннеров TV' })
  findAll() {
    return this.bannerTvService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение баннера TV по ID' })
  findOne(@Param('id') id: number) {
    return this.bannerTvService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBannerTvDto })
  @ApiOperation({ summary: 'Обновление баннера TV' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  update(
    @Param('id') id: number,
    @Body() updateBannerTvDto: UpdateBannerTvDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateBannerTvDto.file = file;
    }
    return this.bannerTvService.update(id, updateBannerTvDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление баннера TV' })
  remove(@Param('id') id: number) {
    return this.bannerTvService.remove(id);
  }
}
