import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBannerMainDto } from './create-banner-main.dto';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformNumberArray } from '@/utils/transform-array';

export class UpdateBannerMainDto extends PartialType(CreateBannerMainDto) {
  @ApiProperty({ description: 'Массив ID магазинов', example: [1, 4] })
  @IsOptional()
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  override store?: number[];
}
