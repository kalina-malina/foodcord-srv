import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class PositionDto {
  @ApiProperty({ description: 'Порядок позиции в заказе', example: 1 })
  @IsNumber()
  positionOrder: number;

  @ApiProperty({ description: 'Код товара', example: '125195' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Количество товара', example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Цена за единицу',
    example: 0.1,
  })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({
    description: 'Общая цена позиции',
    example: 0.1,
  })
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ description: 'Размер скидки', example: 0 })
  @IsNumber()
  discountValue: number;

  @ApiProperty({
    description: 'Фиксированная цена (будет пересчитана из справочника)',
    example: true,
  })
  @IsBoolean()
  isFixedPrice: boolean;

  @ApiProperty({ description: 'Метод расчета', example: 4 })
  @IsNumber()
  calculationMethod: number;
}
