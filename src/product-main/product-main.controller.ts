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
  CreateProductMainAndStoreDto,
  CreateProductMainDto,
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
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiOperation({
    summary: 'Создание продукта для отображения на устройстве',
  })
  async create(
    @Body() createProductMainDto: CreateProductMainDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      createProductMainDto.image = files.image[0];
    }
    return this.productMainService.create(createProductMainDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-product-main-per-store')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiOperation({
    summary: 'Создание продукта для отображения на устройстве',
  })
  async createPerStore(
    @Body() createProductMainAndStoreDto: CreateProductMainAndStoreDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      createProductMainAndStoreDto.image = files.image[0];
    }
    return this.productMainService.createPerStore(createProductMainAndStoreDto);
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
  @Delete('delete-product-main-per-store/:idStore/:id')
  @ApiOperation({
    summary: 'Удаление продукта ',
  })
  removePerStore(@Param('id') id: string, @Param('idStore') idStore: string) {
    return this.productMainService.removePerStore(+id, +idStore);
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

  @UseGuards(JwtAuthGuard)
  @Patch('update-main-product-per-store/:idStore/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiBody({ type: UpdateProductMainDto })
  @ApiOperation({
    summary: 'Обновление продукта',
  })
  updatePerStore(
    @Param('id') id: number,
    @Param('idStore') idStore: string,
    @Body() updateProductMainDto: UpdateProductMainDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    const storeIdNum = +idStore;
    if (files?.image?.[0]) {
      updateProductMainDto.image = files.image[0];
    }
    return this.productMainService.updateProductPerStore(
      id,
      storeIdNum,
      updateProductMainDto,
    );
  }
}
