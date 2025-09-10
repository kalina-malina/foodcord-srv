import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ProductExtrasService } from './product-extras.service';

@Controller('product-extras')
@ApiTags('Ингредиенты продуктов')
@UseGuards(JwtAuthGuard)
export class ProductExtrasController {
  constructor(private readonly productExtrasService: ProductExtrasService) {}
  @ApiOperation({ summary: 'Получить все дополнительные продукты' })
  @Get()
  findAll() {
    return this.productExtrasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить дополнительный продукт по id' })
  findOne(@Param('id') id: string) {
    return this.productExtrasService.findOne(+id);
  }
}
