import { transformNumberArray } from '@/utils/transform-array';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
export class CreateStoreDto {}

export class SearchStoreDto {
  @ApiProperty({ description: 'Города', example: ['Кемерово', 'Новосибирск'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  city?: string[];

  @ApiProperty({
    description: 'Регион',
    example: ['Кемеровская область', 'Новосибирская область'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  region?: string[];

  @ApiProperty({ description: 'Магазины', example: [42002, 42014] })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  idStore?: number[];
}
