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
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BannerTvService } from './banner-tv.service';
import { CreateBannerTvDto } from './dto/create-banner-tv.dto';
import { UpdateBannerTvDto } from './dto/update-banner-tv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerUniversalOptions } from '@/s3/multer.config';
import { CountTvDto } from './dto/count-tv.dto';

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

  @Get('get-all-bunner-tv')
  @ApiOperation({ summary: 'Получение списка всех баннеров TV' })
  findAll() {
    return this.bannerTvService.findAll();
  }

  @Get('get-all-store-bunner-tv/:idStore')
  @ApiOperation({ summary: 'Получение списка всех баннеров TV магазинов' })
  @ApiQuery({
    name: 'tvNumber',
    required: false,
    type: Number,
    description:
      'Номер ТВ. Если не передан — все активные баннеры точки (как раньше)',
  })
  findAllStoreBunner(
    @Param('idStore') idStore: string,
    @Query('tvNumber', new ParseIntPipe({ optional: true })) tvNumber?: number,
  ) {
    return this.bannerTvService.findAllBunnerPerStore(+idStore, tvNumber);
  }

  @Get('get-one-bunner-tv/:id')
  @ApiOperation({ summary: 'Получение баннера TV по ID' })
  findOne(@Param('id') id: number) {
    return this.bannerTvService.findOne(id);
  }

  @Get('get-count-tv/:idStore')
  @ApiOperation({ summary: 'Получение числа телевизоров по id магазина' })
  getCountTv(@Param('idStore') idStore: string) {
    return this.bannerTvService.getCountTv(+idStore);
  }

  @Post('set-count-tv')
  @ApiOperation({ summary: 'Сохранить число телевизоров по id магазина' })
  setCountTv(@Body() body: CountTvDto) {
    return this.bannerTvService.setCountTv(body);
  }

  @Patch('set-count-tv')
  @ApiOperation({ summary: 'Обновить число телевизоров по id магазина' })
  patchCountTv(@Body() body: CountTvDto) {
    return this.bannerTvService.setCountTv(body);
  }

  // @Delete('delete-count-tv/:idStore')
  // @ApiOperation({ summary: 'Удалить телевизоры на точке магазина' })
  // deleteCountTv(@Param('idStore') idStore: string, count: number) {
  //   return this.bannerTvService.deleteCountTv(+idStore, count);
  // }

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
