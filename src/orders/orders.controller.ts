import { Controller, Post, Body, Param, Get, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('orders')
@ApiTags('Заказы')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создание заказа' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Body() createOrderDto: any) {
    this.logger.log(
      'Получен запрос на создание заказа:',
      JSON.stringify(createOrderDto, null, 2),
    );
    return await this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение заказа по id' })
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Получение всех заказов' })
  async findAll() {
    return await this.ordersService.findAll();
  }
}
