import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageOptions } from '@/s3/multer.config';
import { ProductTypeService } from './product-type.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import {
  UpdatePriceProductPerStoreDto,
  UpdatePriceProductPerStoreListDto,
  UpdateProductTypeDto,
} from './dto/update-product-type.dto';

@Controller('product-type')
@ApiTags('Типы продуктов')
@UseGuards(JwtAuthGuard)
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}
  @ApiOperation({ summary: 'Получить все типы продуктов' })
  @Get()
  async findAll() {
    return await this.productTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тип продукта по id' })
  async findOne(@Param('id') id: string) {
    return await this.productTypeService.findOne(+id);
  }

  @Get('get-type-product-per-store/:idStore/:id')
  @ApiOperation({ summary: 'Получить тип продукта по id' })
  async findOnePerStore(
    @Param('id') id: string,
    @Param('idStore') idStore: string,
  ) {
    return await this.productTypeService.findOnePerStore(+idStore, +id);
  }

  @Patch('update-type-product/:id')
  @ApiOperation({ summary: 'Обновить тип продукта по id' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  async update(
    @Param('id') id: string,
    @Body() updateProductTypeDto: UpdateProductTypeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateProductTypeDto.image = file;
    }
    return await this.productTypeService.update(+id, updateProductTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить тип продукта' })
  async delete(@Param('id') id: number) {
    return await this.productTypeService.delete(id);
  }

  @Patch('update-price')
  @ApiOperation({ summary: 'Обновить цену продукта по id и idStore' })
  async updatePrice(
    @Body() updatePriceProductPerStoreDto: UpdatePriceProductPerStoreDto,
  ) {
    return await this.productTypeService.updatePrice(
      updatePriceProductPerStoreDto,
    );
  }

  @Patch('update-price-list')
  @ApiOperation({ summary: 'Обновить список цен и продуктов' })
  async updatePriceList(
    @Body()
    updatePriceProductPerStoreListDto: UpdatePriceProductPerStoreListDto,
  ) {
    return await this.productTypeService.updatePriceList(
      updatePriceProductPerStoreListDto,
    );
  }
}
