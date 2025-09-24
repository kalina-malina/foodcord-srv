import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VARIANT_PRODUCT_ENUM } from '../enum/main.product.enum';
import { transformNumberArray } from '@/utils/transform-array';

export class CreateProductMainDto {
  @ApiProperty({ description: 'Название продукта', example: 'Пицца Маргарита' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Изображение продукта',
  })
  image?: Express.Multer.File;

  @ApiProperty({
    description: 'Описание продукта',
    example: 'Классическая итальянская пицца',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Вариант отображения продукта',
    example: VARIANT_PRODUCT_ENUM.BIG,
  })
  @IsEnum(VARIANT_PRODUCT_ENUM)
  variant: VARIANT_PRODUCT_ENUM;

  @ApiProperty({ description: 'Группы продукта', example: [1, 4] })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  groups: number[];

  @ApiProperty({ description: 'Подгруппы продукта', example: [1, 2] })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  subgroups: number[];

  @ApiProperty({
    description: 'Ингредиенты продукта',
    example: [1, 2, 3],
  })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  ingredients: number[];

  @ApiProperty({
    description: 'Тип продукта',
    example: [1, 2, 3],
  })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  type: number[];

  @ApiProperty({ description: 'Дополнительные продукты', example: [1, 2, 3] })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  extras: number[];

  @ApiProperty({
    description: 'Состав продукта',
    example: 'Тесто, томатный соус, моцарелла, базилик',
  })
  @IsString()
  @IsNotEmpty()
  composition: string;

  @ApiProperty({ description: 'Жиры (г)', example: 8 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  fats: number;

  @ApiProperty({ description: 'Белки (г)', example: 11 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  proteins: number;

  @ApiProperty({ description: 'Углеводы (г)', example: 32 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  carbohydrates: number;

  @ApiProperty({ description: 'Калории', example: 270 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  calories: number;

  @ApiProperty({ description: 'цвета подложки фото продукта' })
  @IsString()
  color: string;
}

export class CreateProductTypeDto {
  @ApiProperty({ description: 'Название типа', example: '25 см' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Цена типа', example: 399.9 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  price: number;
}

export class CreateIngredientDto {
  @ApiProperty({ description: 'Название ингредиента', example: 'Пепперони' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание ингредиента',
    example: 'Острая колбаска',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Цена ингредиента', example: 90 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Изображение ингредиента' })
  @IsOptional()
  @IsString()
  image: string;

  @ApiProperty({ description: 'Цвета подложки фото продукта' })
  @IsString()
  colors: string;
}

export class CreateProductInformationDto {
  @ApiProperty({
    description: 'Состав продукта',
    example: 'Тесто, томатный соус, моцарелла, базилик',
  })
  @IsString()
  @IsNotEmpty()
  composition: string;

  @ApiProperty({
    description: 'Описание продукта',
    example: 'Классическая итальянская пицца',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Жиры (г)', example: 8 })
  @IsNumber()
  fats: number;

  @ApiProperty({ description: 'Белки (г)', example: 11 })
  @IsNumber()
  proteins: number;

  @ApiProperty({ description: 'Углеводы (г)', example: 32 })
  @IsNumber()
  carbohydrates: number;

  @ApiProperty({ description: 'Калории', example: 270 })
  @IsNumber()
  calories: number;
}

export class CreateProductMainDtoDD {
  @ApiProperty({ description: 'Название продукта', example: 'Пицца Маргарита' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Изображение продукта' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Базовая цена продукта', example: 399.9 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Группы продукта', example: [1, 4] })
  @IsArray()
  @IsNumber({}, { each: true })
  group: number[];

  @ApiProperty({ description: 'Подгруппы продукта', example: ['Классика'] })
  @IsArray()
  @IsString({ each: true })
  subgroup: string[];

  @ApiProperty({ description: 'Типы продукта', type: [CreateProductTypeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductTypeDto)
  types: CreateProductTypeDto[];

  @ApiProperty({
    description: 'Ингредиенты продукта',
    type: [CreateIngredientDto],
  })
  @IsArray()
  ingredients: CreateIngredientDto[];

  @ApiProperty({
    description: 'Информация о продукте',
    type: CreateProductInformationDto,
  })
  @ValidateNested()
  @Type(() => CreateProductInformationDto)
  information: CreateProductInformationDto;
}
