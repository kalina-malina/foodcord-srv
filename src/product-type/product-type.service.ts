import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';

@Injectable()
export class ProductTypeService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, name,image FROM products_original WHERE type = $1',
        params: [TYPE_PRODUCT_ENUM.SIZE_PRODUCT],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException('Типы продуктов не найдены');
      }
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `Ошибка при получении типов продуктов: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, name, image FROM products_original WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.SIZE_PRODUCT, id],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException('Тип продукта не найден');
      }
      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `Ошибка при получении типа продукта: ${error.message}`,
      );
    }
  }
}
