import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductIngridientsService } from './product-ingridients.service';
import { CreateProductIngridientDto } from './dto/create-product-ingridient.dto';
import { UpdateProductIngridientDto } from './dto/update-product-ingridient.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('product-ingridients')
@ApiTags(
  'Ингредиенты продуктов(это то что уже в составе продукта, не вдияет на стоймость, добавляется в качестве коментария к заказу)',
)
export class ProductIngridientsController {
  constructor(
    private readonly productIngridientsService: ProductIngridientsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать ингредиент продукта' })
  async create(@Body() createProductIngridientDto: CreateProductIngridientDto) {
    return await this.productIngridientsService.create(
      createProductIngridientDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получить все ингредиенты продуктов' })
  findAll() {
    return this.productIngridientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить ингредиент продукта по id' })
  findOne(@Param('id') id: string) {
    return this.productIngridientsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить ингредиент продукта по id' })
  update(
    @Param('id') id: string,
    @Body() updateProductIngridientDto: UpdateProductIngridientDto,
  ) {
    return this.productIngridientsService.update(
      +id,
      updateProductIngridientDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить ингредиент продукта по id' })
  remove(@Param('id') id: string) {
    return this.productIngridientsService.remove(+id);
  }
}
