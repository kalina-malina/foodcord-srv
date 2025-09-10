import { ApiProperty } from '@nestjs/swagger';

export class ResponseProductListItemDto {
  @ApiProperty({ description: 'ID продукта', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название продукта', example: 'Пицца Маргарита' })
  name: string;

  @ApiProperty({
    description: 'Изображение продукта',
    example:
      'https://cs.pikabu.ru/post_img/2013/04/05/11/1365183909_433145377.jpg',
  })
  image: string;

  @ApiProperty({ description: 'Базовая цена продукта', example: 399.9 })
  price: number;

  @ApiProperty({
    description: 'Группы продукта',
    example: [1, 4],
    type: [Number],
  })
  group: number[];

  @ApiProperty({
    description: 'Подгруппы продукта',
    example: ['Классика'],
    type: [String],
  })
  subgroup: string[];

  @ApiProperty({
    description: 'Минимальная цена среди всех типов',
    example: 399.9,
  })
  minPrice: number;

  @ApiProperty({
    description: 'Максимальная цена среди всех типов',
    example: 599.9,
  })
  maxPrice: number;
}

export class ResponseProductListDto {
  @ApiProperty({
    description: 'Список продуктов',
    type: [ResponseProductListItemDto],
  })
  products: ResponseProductListItemDto[];

  @ApiProperty({ description: 'Общее количество продуктов', example: 25 })
  total: number;

  @ApiProperty({ description: 'Текущая страница', example: 1 })
  page: number;

  @ApiProperty({ description: 'Количество продуктов на странице', example: 10 })
  limit: number;
}
