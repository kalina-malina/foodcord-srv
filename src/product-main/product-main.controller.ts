import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ProductMainService } from './product-main.service';
import {
  CopyProductFromStore,
  CreateProductMainAndStoreDto,
} from './dto/create-product-main.dto';

import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerImageOptions } from '@/s3/multer.config';
import { ResponseProductMainDto } from './dto/response-product-main.dto';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { UpdateProductMainDto } from './dto/update-product-main.dto';

@ApiTags('Продукты для отображения на устройстве')
@Controller('product-main')
export class ProductMainController {
  constructor(private readonly productMainService: ProductMainService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-product-main')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiOperation({
    summary: 'Создание продукта для отображения на устройстве',
  })
  async create(
    @Body() createProductMainDto: CreateProductMainAndStoreDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      createProductMainDto.image = files.image[0];
    }
    return this.productMainService.create(createProductMainDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CopyProductFromStore })
  @Post('copy-product-main-from-store')
  async copyProductFromStore(
    @Body() copyProductFromStore: CopyProductFromStore,
  ) {
    return this.productMainService.copyProductFromStore(copyProductFromStore);
  }

  @Get()
  @ApiOperation({
    summary: 'Получение списка продуктов для отображения на устройстве',
  })
  @ApiResponse({ type: ResponseProductMainDto })
  async findAll() {
    return await this.productMainService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получение продукта по id',
  })
  @ApiResponse({ type: ResponseProductMainDto })
  async findOne(@Param('id') id: string) {
    return await this.productMainService.findOne(+id);
  }

  @Get('find-all-product-per-store/:idStore')
  @ApiOperation({
    summary: 'Получение списка продуктов для отображения на устройстве',
  })
  @ApiResponse({ type: ResponseProductMainDto })
  async findAllPerStore(@Param('idStore') idStore: string) {
    const storeIdNum = +idStore;
    return await this.productMainService.findAllPerStore(storeIdNum);
  }

  @Get('find-all-product-per-store/:idStore/:id')
  @ApiOperation({
    summary: 'Получение продукта по id',
  })
  @ApiResponse({ type: ResponseProductMainDto })
  async findOnePerStore(
    @Param('idStore') idStore: string,
    @Param('id') id: string,
  ) {
    const storeIdNum = +idStore;
    const productIdNum = +id;

    return await this.productMainService.findOnePerStore(
      productIdNum,
      storeIdNum,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Удаление продукта ',
  })
  remove(@Param('id') id: string) {
    return this.productMainService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiBody({ type: UpdateProductMainDto })
  @ApiOperation({
    summary: 'Обновление продукта',
  })
  update(
    @Param('id') id: number,
    @Body() updateProductMainDto: UpdateProductMainDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      updateProductMainDto.image = files.image[0];
    }
    return this.productMainService.update(id, updateProductMainDto);
  }
}
