import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductTypeService } from './product-type.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';

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
}
