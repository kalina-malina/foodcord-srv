import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';

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


export class UpdatePriceProductPerStoreDto{
  @ApiProperty({ description: 'Магазин', required: false })
  @IsNumber()
  idStore: number;


  @ApiProperty({ description: 'Цена', required: false })
  @IsNumber()
  price: number;
}