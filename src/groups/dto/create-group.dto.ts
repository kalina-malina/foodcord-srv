import { transformNumberArray } from '@/utils/transform-array';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Название группы', example: 'Пицца' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Номер магазина',
    example: [42014, 42012, 3],
  })
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  idStore: number[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Изображение группы',
  })
  image: Express.Multer.File;
}
