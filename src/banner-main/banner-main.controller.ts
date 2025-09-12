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
import { BannerMainService } from './banner-main.service';
import { CreateBannerMainDto } from './dto/create-banner-main.dto';
import { UpdateBannerMainDto } from './dto/update-banner-main.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerUniversalOptions } from '@/s3/multer.config';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';

@ApiTags('Баннеры стартового экрана')
@Controller('banner-main')
export class BannerMainController {
  constructor(private readonly bannerMainService: BannerMainService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBannerMainDto })
  @ApiOperation({ summary: 'Создание нового баннера' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  async create(
    @Body() createBannerMainDto: CreateBannerMainDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createBannerMainDto.file = file;
    }
    return this.bannerMainService.create(createBannerMainDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Получение списка всех баннеров' })
  async findAll() {
    return this.bannerMainService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Получение баннера по ID' })
  async findOne(@Param('id') id: string) {
    return this.bannerMainService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBannerMainDto })
  @ApiOperation({ summary: 'Обновление баннера' })
  @UseInterceptors(FileInterceptor('file', multerUniversalOptions))
  async update(
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
  async remove(@Param('id') id: string) {
    return this.bannerMainService.remove(+id);
  }
}
