import { Controller, Post, Body, Param, Get, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@ApiTags('Заказы')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создание заказа' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log('Тип данных:', typeof createOrderDto);
    this.logger.log('Ключи объекта:', Object.keys(createOrderDto));

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

  @Get('all-store-orders/:idStore')
  @ApiOperation({ summary: 'Получение всех заказов магазина' })
  async findAllStoreOrders(@Param('idStore') idStore: number) {
    return await this.ordersService.findAllStoreOrders(idStore);
  }
}
