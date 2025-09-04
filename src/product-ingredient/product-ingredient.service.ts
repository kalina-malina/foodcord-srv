import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';

@Injectable()
export class ProductIngredientService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, name,image FROM products_original WHERE type = $1',
        params: [TYPE_PRODUCT_ENUM.INGRIDIENT],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException('Ингредиенты не найдены');
      }
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при получении ингредиентов: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, name, image FROM products_original WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.INGRIDIENT, id],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException('Ингредиент не найден');
      }
      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при получении ингредиента: ${error.message}`,
      );
    }
  }
}
