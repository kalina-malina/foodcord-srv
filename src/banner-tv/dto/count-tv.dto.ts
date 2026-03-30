import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CountTvDto {
  @ApiProperty({ description: 'ID магазина', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  idStore: number;

  @ApiProperty({ description: 'Количество телевизоров', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  count: number;
}
