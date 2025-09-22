import { transformNumberArray } from '@/utils/transform-array';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateBannerTvDto {
  @ApiProperty({ description: 'Название баннера', example: 'Реклама бетона' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Время показа в секундах', example: 5 })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  @IsOptional()
  @IsNumber()
  seconds?: number;

  @ApiProperty({ description: 'Массив ID магазинов', example: [1, 4] })
  @IsOptional()
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  store?: number[];

  @ApiProperty({ description: 'Активен ли баннер', example: true })
  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл баннера (изображение или видео)',
  })
  file?: Express.Multer.File;

  @ApiProperty({
    type: 'number',
    description: 'Номер телевизора (1/2)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  tv_number: number;
}
