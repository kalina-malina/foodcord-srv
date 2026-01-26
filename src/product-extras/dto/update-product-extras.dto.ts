import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';
import { transformNumber } from '@/utils/transform-array';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductExtrasDto {
  @ApiProperty({
    description: 'Название дополнительного продукта',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Описание дополнительного продукта',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Изображение дополнительного продукта',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({
    description: 'Вес дополнительного продукта',
    required: false,
  })
  @Transform(({ value }) => transformNumber(value))
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({
    description: 'Тип дополнительного продукта',
    required: false,
  })
  @IsOptional()
  @IsEnum(TYPE_PRODUCT_ENUM)
  type?: TYPE_PRODUCT_ENUM;
}
