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

  @ApiProperty({ description: 'Цена', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

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
