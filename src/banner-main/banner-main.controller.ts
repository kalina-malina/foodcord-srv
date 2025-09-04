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
import { BannerMainService } from './banner-main.service';
import { CreateBannerMainDto } from './dto/create-banner-main.dto';
import { UpdateBannerMainDto } from './dto/update-banner-main.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerUniversalOptions } from '@/s3/multer.config';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Баннеры стартового экрана')
@Controller('banner-main')
export class BannerMainController {
  constructor(private readonly bannerMainService: BannerMainService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBannerMainDto })
  @ApiOperation({ summary: 'Создание нового баннера' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  create(
    @Body() createBannerMainDto: CreateBannerMainDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createBannerMainDto.file = file;
    }
    return this.bannerMainService.create(createBannerMainDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка всех баннеров' })
  findAll() {
    return this.bannerMainService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение баннера по ID' })
  findOne(@Param('id') id: string) {
    return this.bannerMainService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBannerMainDto })
  @ApiOperation({ summary: 'Обновление баннера' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  update(
    @Param('id') id: string,
    @Body() updateBannerMainDto: UpdateBannerMainDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateBannerMainDto.file = file;
    }
    return this.bannerMainService.update(+id, updateBannerMainDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление баннера' })
  remove(@Param('id') id: string) {
    return this.bannerMainService.remove(+id);
  }
}
