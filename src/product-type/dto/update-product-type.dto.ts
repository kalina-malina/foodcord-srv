import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';
import { Transform, Type } from 'class-transformer';
import { transformNumber } from '@/utils/transform-array';

export class UpdateProductTypeDto {
  @ApiProperty({ description: 'Название типа продукта', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Описание типа продукта', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Вес', required: false })
  @Transform(({ value }) => transformNumber(value))
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({
    description: 'Изображение',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ description: 'Тип продукта', required: false })
  @IsOptional()
  @IsEnum(TYPE_PRODUCT_ENUM)
  type?: TYPE_PRODUCT_ENUM;
}

export class UpdatePriceProductPerStoreDto {
  @ApiProperty({ description: 'Магазин', example: 42014 })
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  idStore: number;

  @ApiProperty({ description: 'Цена', example: 99.99 })
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  price: number;
}

export class UpdatePriceProductPerStoreListDto {
  @ApiProperty({ description: 'Продукт', example: 6 })
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Продукт', example: 125195 })
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  idProduct: number;
  @ApiProperty({
    type: () => [UpdatePriceProductPerStoreDto],
    description: 'Список продуктов с ценами для обновления',
    example: [
      { idStore: 42014, price: 99.99 },
      { idStore: 42014, price: 149.5 },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePriceProductPerStoreDto)
  list: UpdatePriceProductPerStoreDto[];
}
