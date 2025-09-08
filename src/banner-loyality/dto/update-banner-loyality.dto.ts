import { ApiProperty, PartialType } from '@nestjs/swagger';

import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateBannerLoyalityDto } from './create-banner-loyality.dto';

export class UpdateBannerLoyalityDto extends PartialType(
  CreateBannerLoyalityDto,
) {
  @ApiProperty({ description: 'Массив ID магазинов', example: [1, 4] })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'number') {
      return [value];
    }

    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }

      return value
        .split(',')
        .map((item: string) => {
          const num = parseInt(item.trim());
          return isNaN(num) ? 0 : num;
        })
        .filter((num) => num > 0);
    }

    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  override store?: number[];
}
