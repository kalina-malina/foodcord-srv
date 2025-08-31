import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Pool } from 'pg';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

@Injectable()
export class UpdateProductAllCron {
  private readonly logger = new Logger(UpdateProductAllCron.name);

  constructor(@Inject('DB_SET') private readonly pool: Pool) {}

  /**
   * каждый день в 2:00 утра
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleUpdateAllProducts() {
    this.logger.log('Начинаю обновление всех продуктов...');

    try {
      // Получаем все продукты из базы данных
      const products = await this.getAllProducts();
      this.logger.log(`Найдено ${products.length} продуктов для обновления`);

      // Обновляем каждый продукт
      for (const product of products) {
        await this.updateProduct(product);
      }

      this.logger.log('Обновление всех продуктов завершено успешно');
    } catch (error) {
      this.logger.error('Ошибка при обновлении продуктов:', error);
    }
  }

  /**
   * Получение всех продуктов из базы данных
   */
  private async getAllProducts(): Promise<Product[]> {
    try {
      const query = `
        SELECT
            p.markingofthegood::int AS code,
            g.name as ed,
            p.erpcode AS "id_product_code",
            p.deleted AS "active",
            COALESCE(NULLIF(p.fullname, ''), p.name) AS name,
            p.group_code AS "id_group",
            p.group_code AS "group_code",
            vat,
            groups.name
            FROM un_cg_product as p
            full outer join un_cg_measure as g on  p.measure_code = g.code
            left join un_cg_group as groups on p.group_code = groups.code
            where groups.name ilike '%200.%' and lower(groups.name) not ilike '%выведенные%'
      `;

      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      this.logger.error('Ошибка при получении продуктов из БД:', error);
      throw error;
    }
  }

  /**
   * Обновление отдельного продукта
   */
  private async updateProduct(product: Product): Promise<void> {
    try {
      // Здесь можно добавить логику обновления продукта
      // Например, обновление цены, описания, категории и т.д.

      const updateQuery = `
        UPDATE products 
        SET 
          updated_at = NOW(),
          last_sync_at = NOW()
        WHERE id = $1
      `;

      await this.pool.query(updateQuery, [product.id]);

      this.logger.debug(`Продукт ${product.name} (ID: ${product.id}) обновлен`);
    } catch (error) {
      this.logger.error(`Ошибка при обновлении продукта ${product.id}:`, error);
    }
  }

  /**
   * Получение статистики по продуктам
   */
  private async getProductStats(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_products,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
          COUNT(CASE WHEN updated_at < NOW() - INTERVAL '7 days' THEN 1 END) as outdated_products
        FROM products
      `;

      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Ошибка при получении статистики продуктов:', error);
      throw error;
    }
  }

  /**
   * Очистка ресурсов при завершении работы
   */
  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Подключение к базе данных закрыто');
  }
}
