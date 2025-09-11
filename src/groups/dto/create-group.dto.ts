import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Название группы', example: 'Пицца' })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Изображение группы',
  })
  image: Express.Multer.File;
}
