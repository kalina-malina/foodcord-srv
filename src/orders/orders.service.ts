import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { ORDERS_STATUS } from './enum/orders-status.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createOrderDto: CreateOrderDto) {
    const transaction = await this.databaseService.beginTransaction();
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `INSERT INTO orders (id_store, phone_number, products, status) VALUES ($1, $2, $3, $4) RETURNING id`,
        params: [
          createOrderDto.idStore,
          createOrderDto.phoneNumber,
          JSON.stringify(createOrderDto.products),
          ORDERS_STATUS.NEW,
        ],
        transaction: transaction,
      });

      await this.databaseService.commitTransaction(transaction);

      return {
        message: 'Заказ создан',
        orderId: +result.rows[0]?.id,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      return {
        message: 'Ошибка при создании заказа',
        error: error.message,
      };
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
  async findAll() {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: 'SELECT * FROM orders',
    });
    return result.rows;
  }
  async findOne(id: string) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `SELECT * FROM orders WHERE id = ${id}`,
    });
    return result.rows;
  }
}
