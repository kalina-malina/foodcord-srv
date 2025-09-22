import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RECEIVING_METHODS } from '../enum/receiving-methods.enum';

export class ProductIncludeDto {
  @ApiProperty({ description: 'ID дополнения в БД' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Название дополнения' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Количество дополнения' })
  @IsNumber()
  count: number;
}

export class ProductDto {
  @ApiProperty({ description: 'ID продукта в БД' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Название основного блюда' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Количество продукта' })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'Дополнения к продукту',
    type: [ProductIncludeDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  include?: ProductIncludeDto[];

  @ApiProperty({
    description: 'Убранные позиции (текстом)',
    required: false,
    example: 'Убрать: соль, лук, перец',
  })
  @IsString()
  @IsOptional()
  exclude?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Продукты в заказе',
    type: [ProductDto],
    example: [
      {
        id: 125195,
        name: 'Салатик курица',
        count: 2,
        include: [
          {
            id: 1,
            name: 'Курица',
            count: 1,
          },
        ],
        exclude: 'Убрать: соль, лук, перец',
      },
    ],
  })
  @IsArray()
  products: ProductDto[];

  @ApiProperty({ description: 'ID магазина' })
  @IsNumber()
  idStore: number;

  @ApiProperty({
    description: 'Телефон клиента (опционально)',
    example: 79991234567,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  phoneNumber?: number;

  @ApiProperty({
    description: 'Метод получения',
    example: RECEIVING_METHODS.SELF_SERVICE,
  })
  @IsEnum(RECEIVING_METHODS)
  receivingMethod: RECEIVING_METHODS;
}
