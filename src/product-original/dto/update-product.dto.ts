import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  TYPE_PRODUCT_ENUM,
  TYPE_PRODUCT_ENUM_VALUE,
} from '../enum/type-prodict.enum';
import { Transform } from 'class-transformer';

export class UpdateProductOriginslDto {
  @ApiProperty({ description: 'Название для просмотра' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Описание' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Фотография',
  })
  image?: Express.Multer.File;

  @ApiProperty({
    description: `Тип продукта: ${Object.values(TYPE_PRODUCT_ENUM_VALUE).join(' или ')}`,
  })
  @IsEnum(TYPE_PRODUCT_ENUM)
  @IsNotEmpty()
  type: TYPE_PRODUCT_ENUM;

  @ApiProperty({ description: 'Вес продукта' })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  @IsNotEmpty()
  weight: number;
}
