import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { ORDERS_STATUS } from './enum/orders-status.enum';

@Injectable()
export class OrdersService {
  private ordersGateway: any; // Избегаем циркулярной зависимости

  constructor(private readonly databaseService: DatabaseService) {}

  // Метод для установки gateway (вызывается из модуля)
  setGateway(gateway: any) {
    this.ordersGateway = gateway;
  }
  async create(createOrderDto: CreateOrderDto) {
    const transaction = await this.databaseService.beginTransaction();
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `INSERT INTO orders (id_store, phone_number, products, status) VALUES ($1, $2, $3, $4) RETURNING id`,
        params: [
          createOrderDto.idStore,
          createOrderDto.phoneNumber,
          createOrderDto.products,
          ORDERS_STATUS.NEW,
        ],
        transaction: transaction,
      });

      await this.databaseService.commitTransaction(transaction);

      const orderData = {
        message: 'Заказ создан',
        orderId: +result.rows[0]?.id,
        products: createOrderDto.products,
        idStore: createOrderDto.idStore,
        phoneNumber: createOrderDto.phoneNumber,
        status: ORDERS_STATUS.NEW,
        createdAt: new Date().toISOString(),
      };

      // Отправляем уведомление через WebSocket
      if (this.ordersGateway) {
        this.ordersGateway.notifyNewOrder(orderData);
      }

      return orderData;
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
      query: `SELECT * FROM orders WHERE id = $1`,
      params: [id],
    });
    return result.rows;
  }

  async updateStatus(orderId: number, status: ORDERS_STATUS) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      params: [status, orderId],
    });

    if (result.rows.length === 0) {
      throw new Error(`Заказ с ID ${orderId} не найден`);
    }

    return result.rows[0];
  }
}
