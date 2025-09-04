import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGroupSubDto {
  @ApiProperty({ description: 'Название подгруппы', example: 'Маленькая' })
  @IsString()
  name: string;
}
