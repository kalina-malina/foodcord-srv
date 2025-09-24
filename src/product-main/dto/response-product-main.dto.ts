import { ApiProperty } from '@nestjs/swagger';
import { VARIANT_PRODUCT_ENUM } from '../enum/main.product.enum';

export class ProductTypeDto {
  @ApiProperty({ description: 'ID типа продукта', example: 2 })
  id: number;

  @ApiProperty({ description: 'Название типа', example: '45' })
  name: string;

  @ApiProperty({ description: 'Цена типа', example: 0 })
  price: number;

  @ApiProperty({ description: 'Вес типа', example: null, nullable: true })
  weight: number | null;
}

export class ProductGroupDto {
  @ApiProperty({ description: 'ID группы', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название группы', example: 'лимонад' })
  name: string;
}

export class ProductExtraDto {
  @ApiProperty({ description: 'ID дополнения', example: 4 })
  id: number;

  @ApiProperty({
    description: 'Название дополнения',
    example: 'gthxbr xbkb',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({ description: 'Цена дополнения', example: 0 })
  price: number;
}

export class ProductInformationDto {
  @ApiProperty({ description: 'Жиры (г)', example: 8 })
  fats: number;

  @ApiProperty({ description: 'Калории', example: 270 })
  calories: number;

  @ApiProperty({ description: 'Белки (г)', example: 11 })
  proteins: number;

  @ApiProperty({
    description: 'Состав продукта',
    example: 'Тесто, томатный соус, моцарелла, базилик',
  })
  composition: string;

  @ApiProperty({
    description: 'Описание продукта',
    example: 'Классическая итальянская пицца',
  })
  description: string;

  @ApiProperty({ description: 'Углеводы (г)', example: 32 })
  carbohydrates: number;
}

export class ResponseProductMainDto {
  @ApiProperty({ description: 'ID продукта', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название продукта', example: 'Пицца Маргарита' })
  name: string;

  @ApiProperty({
    description: 'Изображение продукта',
    example:
      'https://cs.pikabu.ru/post_img/2013/04/05/11/1365183909_433145377.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Варианты продукта',
    example: VARIANT_PRODUCT_ENUM.BIG,
  })
  variant: string;

  @ApiProperty({ description: 'Цвет продукта', example: null, nullable: true })
  color: string | null;

  @ApiProperty({
    description: 'Группы продукта',
    type: [ProductGroupDto],
  })
  groups: ProductGroupDto[];

  @ApiProperty({
    description: 'Подгруппы продукта',
    example: ['лимонад', 'вапва'],
    type: [String],
  })
  subgroup: string[];

  @ApiProperty({
    description: 'Дополнения продукта',
    type: [ProductExtraDto],
  })
  extras: ProductExtraDto[];

  @ApiProperty({
    description: 'Ингредиенты продукта',
    example: ['песок'],
    type: [String],
  })
  ingredients: string[];

  @ApiProperty({
    description: 'Типы продукта (размеры)',
    type: [ProductTypeDto],
  })
  type: ProductTypeDto[];

  @ApiProperty({
    description: 'Информация о продукте',
    type: ProductInformationDto,
  })
  information: ProductInformationDto;
}
