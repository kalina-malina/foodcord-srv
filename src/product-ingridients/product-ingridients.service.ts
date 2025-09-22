import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateProductIngridientDto } from './dto/create-product-ingridient.dto';
import { UpdateProductIngridientDto } from './dto/update-product-ingridient.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';

@Injectable()
export class ProductIngridientsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createProductIngridientDto: CreateProductIngridientDto) {
    const transaction = await this.databaseService.beginTransaction();
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'SELECT * FROM products_ingredients WHERE name = $1',
        params: [createProductIngridientDto.name],
        transaction,
      });
      if (result.rows.length > 0) {
        throw new ConflictException('ингредиент продукта уже существует');
      }

      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'INSERT INTO products_ingredients (name) VALUES ($1)',
        params: [createProductIngridientDto.name],
        transaction,
      });
      await this.databaseService.commitTransaction(transaction);
      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      throw new BadGatewayException(
        `ошибка при создании ингредиента продукта: ${error.message}`,
      );
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'SELECT * FROM products_ingredients',
      });
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при получении всех ингредиентов продуктов: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'SELECT * FROM products_ingredients WHERE id = $1',
        params: [id],
      });
      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при получении ингредиента продукта по id: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    updateProductIngridientDto: UpdateProductIngridientDto,
  ) {
    try {
      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.UPDATE,
        table_name: 'products_ingredients',
        conflict: ['id'],
        columnUpdate: ['name'],
        data: [{ id: id, name: updateProductIngridientDto.name }],
      });
      return {
        success: true,
        message: 'ингредиент продукта обновлен',
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при обновлении ингредиента продукта по id: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    try {
      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'DELETE FROM products_ingredients WHERE id = $1',
        params: [id],
      });
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при удалении ингредиента продукта по id: ${error.message}`,
      );
    }
  }
}
