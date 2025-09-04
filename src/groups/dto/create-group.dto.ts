import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Название группы', example: 'Пицца' })
  @IsString()
  name: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Изображение группы',
  })
  image?: Express.Multer.File;
}
