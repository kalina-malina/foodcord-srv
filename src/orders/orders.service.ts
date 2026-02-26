import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { ORDERS_STATUS } from './enum/orders-status.enum';
import { SendOrderService } from '@/send-order/send-order.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  private ordersGateway: any;
  private readonly logger = new Logger(OrdersService.name);
  private orderTable: string;
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly sendOrderService: SendOrderService,
    private configService: ConfigService,
  ) {
    this.orderTable =
      this.configService.get<string>('SERVER') === 'PROD'
        ? 'orders'
        : 'orders';
  }

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

      const maxIdResult = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `
          SELECT COALESCE(MAX(daily_id), 0)::int as max_id 
          FROM ${this.orderTable} 
          WHERE id_store = $1 
            AND date(create_at) = CURRENT_DATE
        `,
        params: [createOrderDto.idStore],
        transaction: transaction,
      });

      let nextDailyId = maxIdResult.rows[0].max_id + 1;

      if (nextDailyId > 999) {
        nextDailyId = 1;
      }

      // Преобразуем каждый продукт в правильный объект
      const normalizedProducts = createOrderDto.products.map((product) => ({
        id: Number(product.id),
        name: String(product.name),
        count: Number(product.count),
        price: Number(product.price),
        ...(product.include && {
          include: product.include.map((item) => ({
            id: Number(item.id),
            name: String(item.name),
            count: Number(item.count),
            price: Number(item.price),
          })),
        }),
        ...(product.exclude && { exclude: String(product.exclude) }),
      }));

      const productsJson = JSON.stringify(normalizedProducts);

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `INSERT INTO ${this.orderTable} (id_store, daily_id, phone_number, products, status, receiving_method, create_at, updated_at) VALUES ($1, $2, $3, $4::json, $5, $6, NOW(), NOW()) RETURNING *`,
        params: [
          createOrderDto.idStore,
          nextDailyId,
          createOrderDto.phoneNumber || null,
          productsJson,
          ORDERS_STATUS.NEW,
          createOrderDto.receivingMethod,
        ],
        transaction: transaction,
      });
      ///цена подставляем явно

      const productPositions = normalizedProducts.map((product, index) => ({
        positionOrder: index + 1,
        code: product.id.toString(),
        quantity: product.count,
        unitPrice: product.price,
        totalPrice: product.price * product.count,
        discountValue: 0,
        isFixedPrice: true,
        calculationMethod: 4,
      }));

      // Отправляем заказ в SetRetail10
      const sendResult = await this.sendOrderService.sendOrder(
        `IM${result.rows[0]?.id}`,
        result.rows[0]?.id_store,
        productPositions,
      );
      if (!sendResult.success) {
        return {
          message: `Ошибка при отправке заказа в SetRetail10 ${sendResult.status} ${sendResult.data}`,
          error: sendResult.message,
        };
      }

      // const orderData = {
      //   message: 'Заказ создан',
      //   ...result.rows[0],
      //   products: normalizedProducts,
      //   sendResult: sendResult,
      // };

      const orderData = {
        message: 'Заказ создан',
        orderId: +result.rows[0]?.id,
        dailyId: +result.rows[0]?.daily_id,
        products: normalizedProducts,
        idStore: createOrderDto.idStore,
        phoneNumber: createOrderDto.phoneNumber,
        status: ORDERS_STATUS.NEW,
        createdAt: new Date().toISOString(),
      };

      await this.databaseService.commitTransaction(transaction);

      if (this.ordersGateway) {
        this.ordersGateway.notifyNewOrderToStore(
          orderData,
          result.rows[0]?.id_store,
        );
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
      query: `SELECT id::int, id_store::int, daily_id::int, phone_number,
       products, status, receiving_method,
       TO_CHAR(create_at, 'DD.MM.YYYY, HH24:MI:SS') as create_at,
       TO_CHAR(updated_at, 'DD.MM.YYYY, HH24:MI:SS') as updated_at
       FROM ${this.orderTable}
       where date(create_at) = current_date
       ORDER BY create_at DESC`,
    });

    if (!result || !result.rows || !Array.isArray(result.rows)) {
      this.logger.warn(
        'Результат запроса не содержит rows или rows не является массивом',
      );
      return [];
    }

    // Парсим JSON для каждого заказа и обогащаем данными о продуктах
    const orders = await Promise.all(
      result.rows.map(async (order: any) => {
        const products =
          typeof order.products === 'string'
            ? JSON.parse(order.products)
            : order.products;

        // Получаем названия продуктов для каждого продукта в заказе
        const enrichedProducts = await Promise.all(
          products.map(async (product: any) => {
            try {
              const productResult = await this.databaseService.executeOperation(
                {
                  operation: GRUD_OPERATION.QUERY,
                  query: `SELECT name_original FROM products_original WHERE id = $1`,
                  params: [product.id],
                },
              );

              return {
                ...product,
                name_original: productResult.rows[0]?.name_original || null,
              };
            } catch {
              return {
                ...product,
                name_original: null,
              };
            }
          }),
        );

        return {
          ...order,
          products: enrichedProducts,
        };
      }),
    );

    return orders;
  }

  async findAllStoreOrders(idStore: number) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `SELECT id::int, id_store::int, daily_id::int, phone_number,
       products, status, receiving_method,
       TO_CHAR(create_at, 'DD.MM.YYYY, HH24:MI:SS') as create_at,
       TO_CHAR(updated_at, 'DD.MM.YYYY, HH24:MI:SS') as updated_at
       FROM ${this.orderTable}
       where date(create_at) = current_date
       and id_store = $1
       ORDER BY create_at DESC`,
      params: [idStore],
    });

    if (!result || !result.rows || !Array.isArray(result.rows)) {
      this.logger.warn(
        'Результат запроса не содержит rows или rows не является массивом',
      );
      return [];
    }

    // Парсим JSON для каждого заказа и обогащаем данными о продуктах
    const orders = await Promise.all(
      result.rows.map(async (order: any) => {
        const products =
          typeof order.products === 'string'
            ? JSON.parse(order.products)
            : order.products;

        // Получаем названия продуктов для каждого продукта в заказе
        const enrichedProducts = await Promise.all(
          products.map(async (product: any) => {
            try {
              const productResult = await this.databaseService.executeOperation(
                {
                  operation: GRUD_OPERATION.QUERY,
                  query: `SELECT name_original FROM products_original WHERE id = $1`,
                  params: [product.id],
                },
              );

              return {
                ...product,
                name_original: productResult.rows[0]?.name_original || null,
              };
            } catch {
              return {
                ...product,
                name_original: null,
              };
            }
          }),
        );

        return {
          ...order,
          products: enrichedProducts,
        };
      }),
    );

    return orders;
  }

  async findOne(id: string) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `SELECT id::int, id_store::int, daily_id::int, phone_number, products, status, receiving_method,
      TO_CHAR(create_at, 'DD.MM.YYYY, HH24:MI:SS') as create_at,
      TO_CHAR(updated_at, 'DD.MM.YYYY, HH24:MI:SS') as updated_at 
      FROM ${this.orderTable} WHERE id = $1`,
      params: [id],
    });

    // Проверяем, что result.rows существует и является массивом
    if (!result || !result.rows || !Array.isArray(result.rows)) {
      this.logger.warn(
        'Результат запроса не содержит rows или rows не является массивом',
      );
      return null;
    }

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];
    const products =
      typeof order.products === 'string'
        ? JSON.parse(order.products)
        : order.products;

    // Получаем названия продуктов для каждого продукта в заказе
    const enrichedProducts = await Promise.all(
      products.map(async (product: any) => {
        try {
          const productResult = await this.databaseService.executeOperation({
            operation: GRUD_OPERATION.QUERY,
            query: `SELECT name_original FROM products_original WHERE id = $1`,
            params: [product.id],
          });

          return {
            ...product,
            name_original: productResult.rows[0]?.name_original || null,
          };
        } catch {
          return {
            ...product,
            name_original: null,
          };
        }
      }),
    );

    return {
      ...order,
      products: enrichedProducts,
    };
  }

  async updateStatus(orderId: number, status: ORDERS_STATUS) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `UPDATE ${this.orderTable} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      params: [status, orderId],
    });

    if (!result || !result.rows || !Array.isArray(result.rows)) {
      this.logger.warn(
        'Результат запроса не содержит rows или rows не является массивом',
      );
      throw new Error(`Ошибка при обновлении статуса заказа ${orderId}`);
    }

    if (result.rows.length === 0) {
      throw new Error(`Заказ с ID ${orderId} не найден`);
    }

    return result.rows[0];
  }
}
