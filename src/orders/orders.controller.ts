import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('orders')
@ApiTags('Создание заказа')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создание заказа' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }
}
