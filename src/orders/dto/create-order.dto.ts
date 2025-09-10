import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductOrderDto {
  @ApiProperty({ description: 'id_продукта' })
  @IsNumber({}, { each: true })
  idProducts: number;

  @ApiProperty({ description: 'количество продуктов' })
  @IsNumber()
  count: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'id_магазина' })
  @IsNumber()
  idStore: number;

  @ApiProperty({ description: 'карта клиента' })
  @IsNumber()
  @IsOptional()
  cardNumber: number;

  @ApiProperty({ description: 'id_продуктов' })
  @IsArray()
  products: ProductOrderDto[];

  @ApiProperty({ description: 'количество продуктов' })
  @IsNumber()
  count: number;

  @ApiProperty({ description: 'коментарий к заказу' })
  @IsString()
  comment: string;
}
