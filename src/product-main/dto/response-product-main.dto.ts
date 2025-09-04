import { ApiProperty } from '@nestjs/swagger';

export class ProductTypeDto {
  @ApiProperty({ description: 'ID типа продукта', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название типа', example: '25 см' })
  name: string;

  @ApiProperty({ description: 'Цена типа', example: 399.9 })
  price: number;
}

export class IngredientDto {
  @ApiProperty({ description: 'ID ингредиента', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название ингредиента', example: 'Пепперони' })
  name: string;

  @ApiProperty({
    description: 'Описание ингредиента',
    example: 'Острая колбаска',
  })
  description: string;

  @ApiProperty({ description: 'Цена ингредиента', example: 90 })
  price: number;

  @ApiProperty({
    description: 'Изображение ингредиента',
    example: 'https://example.com/ingredient.jpg',
  })
  image: string;
}

export class ProductInformationDto {
  @ApiProperty({ description: 'ID информации о продукте', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Состав продукта',
    example: 'Тесто, томатный соус, моцарелла, базилик',
  })
  composition: string;

  @ApiProperty({
    description: 'Описание продукта',
    example:
      'Классическая итальянская пицца с ароматным томатным соусом и свежим базиликом.',
  })
  description: string;

  @ApiProperty({ description: 'Жиры (г)', example: 8 })
  fats: number;

  @ApiProperty({ description: 'Белки (г)', example: 11 })
  proteins: number;

  @ApiProperty({ description: 'Углеводы (г)', example: 32 })
  carbohydrates: number;

  @ApiProperty({ description: 'Калории', example: 270 })
  calories: number;
}

export class ResponseProductMainDto {
  @ApiProperty({ description: 'ID продукта', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название продукта', example: 'Пицца Маргарита' })
  name: string;

  @ApiProperty({
    description: 'Изображение продукта',
    example: 'https://example.com/pizza.jpg',
  })
  image: string;

  @ApiProperty({ description: 'Базовая цена продукта', example: 399.9 })
  price: number;

  @ApiProperty({
    description: 'Группы продукта',
    example: [1, 4],
    type: [Number],
  })
  group: number[];

  @ApiProperty({
    description: 'Подгруппы продукта',
    example: ['Классика'],
    type: [String],
  })
  subgroup: string[];

  @ApiProperty({
    description: 'Типы продукта (размеры)',
    type: [ProductTypeDto],
  })
  types: ProductTypeDto[];

  @ApiProperty({
    description: 'Ингредиенты продукта',
    type: [IngredientDto],
  })
  ingredients: IngredientDto[];

  @ApiProperty({
    description: 'Информация о продукте',
    type: ProductInformationDto,
  })
  information: ProductInformationDto;
}
