import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Pool } from 'pg';

@Injectable()
export class UpdateProductAllCron {
  private readonly logger = new Logger(UpdateProductAllCron.name);

  constructor(
    private readonly databaseService: DatabaseService,
    @Inject('DB_SET') private readonly poolset: Pool,
  ) {}

  /**
   * каждый день в 2:00 утра
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleUpdateAllProducts() {
    this.logger.log('обновление всех продуктов из сет...');

    try {
      await this.getAllOriginslProducts();

      this.logger.log('Обновление всех продуктов завершено успешно');
    } catch (error) {
      this.logger.error('Ошибка при обновлении продуктов:', error);
    }
  }

  /**
   * Получение всех продуктов из базы данных
   */
  async getAllOriginslProducts() {
    // Promise<Product[]>
    try {
      const query = `
        SELECT
            p.markingofthegood::int AS id_product,
            g.name as ed,
            p.erpcode ,
            p.deleted,
            COALESCE(NULLIF( p.name, ''), p.fullname) AS name_original,
            p.group_code AS "group_code",
            vat ::int,
            groups.name as group_name
            FROM un_cg_product as p
            full outer join un_cg_measure as g on  p.measure_code = g.code
            left join un_cg_group as groups on p.group_code = groups.code
            where groups.name ilike '%200.%' and groups.name ilike  '%Лимонады%' and lower(groups.name) not ilike '%выведенные%'
            order by p.markingofthegood asc
      `;

      const result = await this.poolset.query(query);

      if (result.rows.length > 0) {
        const updateProduct = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.INSERT_ON_UPDAETE,
          table_name: 'products_original',
          data: result.rows,
          conflict: ['id_product'],
          columnUpdate: [
            'id_product',
            'ed',
            'erpcode',
            'deleted',
            'name_original',
            'group_code',
            'vat',
            'group_name',
          ],
        });
        return {
          message: 'Обновление продуктов завершено успешно',
          operation: updateProduct,
        };
      }

      return {
        message: 'Не получены проудкты для обновления',
        operation: {
          insert: 0,
          update: 0,
        },
      };
    } catch (error) {
      this.logger.error('Ошибка при получении продуктов из БД:', error);
      throw error;
    }
  }
}
