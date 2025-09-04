import { Controller, Get, Param } from '@nestjs/common';
import { ProductIngredientService } from './product-ingredient.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('product-ingredient')
@ApiTags('Ингредиенты продуктов')
export class ProductIngredientController {
  constructor(
    private readonly productIngredientService: ProductIngredientService,
  ) {}
  @ApiOperation({ summary: 'Получить все ингредиенты продуктов' })
  @Get()
  findAll() {
    return this.productIngredientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить ингредиент продукта по id' })
  findOne(@Param('id') id: string) {
    return this.productIngredientService.findOne(+id);
  }
}
