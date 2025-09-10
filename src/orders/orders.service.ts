import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  async create(createOrderDto: CreateOrderDto) {
    void createOrderDto;
    return 'This action adds a new order';
  }
}
