import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { ORDERS_STATUS } from './enum/orders-status.enum';

@Injectable()
export class OrdersService {
  private ordersGateway: any;

  constructor(private readonly databaseService: DatabaseService) {}

  setGateway(gateway: any) {
    this.ordersGateway = gateway;
  }
  async create(createOrderDto: CreateOrderDto) {
    const transaction = await this.databaseService.beginTransaction();
    try {
      // Валидация и подготовка данных
      if (!createOrderDto.products || !Array.isArray(createOrderDto.products)) {
        throw new Error('Продукты должны быть массивом');
      }

      // Преобразуем каждый продукт в правильный объект
      const normalizedProducts = createOrderDto.products.map((product) => ({
        id: Number(product.id),
        count: Number(product.count),
        comment: String(product.comment),
      }));

      const productsJson = JSON.stringify(normalizedProducts);

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `INSERT INTO orders (id_store, phone_number, products, status, create_at, updated_at) VALUES ($1, $2, $3::json, $4, NOW(), NOW()) RETURNING id, create_at`,
        params: [
          createOrderDto.idStore,
          createOrderDto.phoneNumber,
          productsJson, // Передаем как строку и приводим к JSON в SQL
          ORDERS_STATUS.NEW,
        ],
        transaction: transaction,
      });

      await this.databaseService.commitTransaction(transaction);

      const orderData = {
        message: 'Заказ создан',
        orderId: +result.rows[0]?.id,
        products: normalizedProducts, // Используем нормализованные продукты
        idStore: createOrderDto.idStore,
        phoneNumber: createOrderDto.phoneNumber,
        status: ORDERS_STATUS.NEW,
        createdAt: new Date().toISOString(),
      };

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
      query:
        'SELECT id, id_store, phone_number, products, status, create_at, updated_at FROM orders ORDER BY create_at DESC',
    });

    // Парсим JSON для каждого заказа
    const orders = result.rows.map((order: any) => ({
      ...order,
      products:
        typeof order.products === 'string'
          ? JSON.parse(order.products)
          : order.products,
    }));

    return orders;
  }
  async findOne(id: string) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `SELECT id, id_store, phone_number, products, status, create_at, updated_at FROM orders WHERE id = $1`,
      params: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];
    return {
      ...order,
      products:
        typeof order.products === 'string'
          ? JSON.parse(order.products)
          : order.products,
    };
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
