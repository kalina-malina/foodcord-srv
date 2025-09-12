import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createOrderDto: CreateOrderDto) {
    void createOrderDto;
    return 'This action adds a new order';
  }
}
