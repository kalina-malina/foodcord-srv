import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductDto {
  @ApiProperty({ description: 'id_продукта' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'количество продуктов' })
  @IsNumber()
  count: number;

  @ApiProperty({ description: 'коментарий к заказу' })
  @IsString()
  comment: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'продукты в заказе',
    type: [ProductDto],
  })
  @IsArray()
  products: ProductDto[];

  @ApiProperty({ description: 'id_магазина' })
  @IsNumber()
  idStore: number;

  @ApiProperty({ description: 'Телефон клиента' })
  @IsNumber()
  @IsOptional()
  phoneNumber: number;
}
