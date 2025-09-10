import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductIngridientDto {
  @ApiProperty({ example: 'песок', description: 'Название ингредиента' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
