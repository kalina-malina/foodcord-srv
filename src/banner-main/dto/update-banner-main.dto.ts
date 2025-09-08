import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBannerMainDto } from './create-banner-main.dto';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBannerMainDto extends PartialType(CreateBannerMainDto) {
  @ApiProperty({ description: 'Массив ID магазинов', example: [1, 4] })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }
    // Если это число (не строка)
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

      // Если это строка вида "1,2,3"
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
