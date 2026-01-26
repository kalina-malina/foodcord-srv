import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';
import { S3StorageService } from '@/s3/storage.service';
import { UploadPhotoService } from '@/s3/upload-photo';
import { ConfigService } from '@nestjs/config';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';
import {
  UpdatePriceProductPerStoreListDto,
  UpdateProductTypeDto,
} from './dto/update-product-type.dto';
import { PoolClient } from 'pg';

@Injectable()
export class ProductTypeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly s3Storage: S3StorageService,
    private readonly uploadPhotoService: UploadPhotoService,
    private readonly configService: ConfigService,
  ) {}
  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int,  id_product::int as "idProduct", name_original as name, description, weight::int, type, image FROM products_original_test WHERE type = $1',
        params: [TYPE_PRODUCT_ENUM.TYPE],
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
          'SELECT id::int, id_product::int as "idProduct", name_original as name, description, weight::int,  type, image FROM products_original_test WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.TYPE, id],
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
  async findOnePerStore(idStore: number, id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `SELECT id::int, id_product as "idProduct", name_original as name, description, weight::int,  type, image, price 
          FROM products_original_test pot
          LEFT JOIN product_original_store_price posp ON posp.id_product = pot.id_product
          WHERE type = $1 AND id = $2 AND id_store = $3`,
        params: [TYPE_PRODUCT_ENUM.TYPE, id, idStore],
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

  async update(id: number, body: UpdateProductTypeDto) {
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      const existingProduct = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id, name_original, description, image, weight FROM products_original_test WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.TYPE, id],
        transaction: transaction,
      });

      if (existingProduct.rows.length === 0) {
        throw new NotFoundException('Тип продукта не найден');
      }

      const { name, description, weight, image, type } = body;

      const updateData: any = { id };
      const columnUpdate: string[] = [];

      if (name !== undefined) {
        updateData.name = name;
        columnUpdate.push('name');
      }

      if (description !== undefined) {
        updateData.description = description;
        columnUpdate.push('description');
      }

      if (weight !== undefined) {
        updateData.weight = weight;
        columnUpdate.push('weight');
      }

      if (type !== undefined) {
        updateData.type = type;
        columnUpdate.push('type');
      }

      if (columnUpdate.length > 0) {
        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'products_original_test',
          conflict: ['id'],
          columnUpdate: columnUpdate,
          data: [updateData],
          transaction: transaction,
        });
      }

      if (image) {
        const urlImage = await this.uploadPhotoService.uploadPhoto(
          image,
          S3_PATCH_ENUM.PACH_PRODUCT_ORIGINAL_IMAGE,
          id.toString(),
        );

        if (urlImage) {
          await this.databaseService.executeOperation({
            operation: GRUD_OPERATION.UPDATE,
            table_name: 'products_original_test',
            conflict: ['id'],
            columnUpdate: ['image'],
            data: [{ id, image: urlImage }],
            transaction: transaction,
          });
        }
      }

      await this.databaseService.commitTransaction(transaction);

      return {
        success: true,
        message: `Тип продукта ${id} успешно обновлен`,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadGatewayException(
        `Ошибка при обновлении типа продукта: ${error.message}`,
      );
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async updatePriceList(body: UpdatePriceProductPerStoreListDto) {
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      // 1. Проверяем наличие списка продуктов
      if (!body.list || !Array.isArray(body.list)) {
        throw new BadRequestException(
          'Список продуктов отсутствует или имеет неверный формат',
        );
      }

      if (body.list.length === 0) {
        throw new BadRequestException('Список продуктов пуст');
      }

      // 2. Проверяем существование продукта
      const existingProduct = (await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `SELECT id::int, id_product::int as "idProduct" FROM products_original_test WHERE id = $1`,
        params: [body.id],
        transaction: transaction,
      })) as { rows: { id: number; idProduct: number }[] };

      if (existingProduct.rows.length === 0) {
        throw new NotFoundException('Тип продукта не найден');
      }

      // 3. Используем idProduct из DTO или из БД
      const idProduct = body.idProduct || existingProduct.rows[0]!.idProduct;
      
      // Удаляем все цены для данного продукта
      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.DELETE,
        table_name: 'product_original_store_price',
        conflict: ['id_product'],
        data: [{ id_product: idProduct }],
        transaction: transaction,
      });

      // Удаляем все магазины из массива id_store для всех продуктов, где body.id находится в type или extras
      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `UPDATE products_main_test
                SET id_store = ARRAY[]::bigint[]
                WHERE $1 = ANY("type") OR $1 = ANY(extras)`,
        params: [body.id],
        transaction: transaction,
      });


      // 4. Обрабатываем каждый элемент списка
      for (const item of body.list) {
        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.INSERT_ON_UPDAETE,
          table_name: 'product_original_store_price',
          conflict: ['id_product', 'id_store'],
          columnUpdate: ['price'],
          data: [
            {
              id_product: idProduct,
              id_store: item.idStore,
              price: item.price,
            },
          ],
          transaction: transaction,
        });

        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.QUERY,
          query: `UPDATE products_main_test
                  SET id_store = CASE
                    WHEN id_store IS NULL THEN ARRAY[$1]::bigint[]
                    WHEN NOT ($1 = ANY(id_store)) THEN array_append(id_store, $1)
                    ELSE id_store
                  END
                  WHERE $2 = ANY("type") OR $2 = ANY(extras)`,
          params: [item.idStore, body.id],
          transaction: transaction,
        });
      }

      await this.databaseService.commitTransaction(transaction);
      return {
        message: `Успешно изменена цена у продуктов`,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadGatewayException(
        `Ошибка при обновлении типов продуктов: ${error.message}`,
      );
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
  async getProductPriceToType(idProduct: number) {
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      const existingProduct = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `SELECT id_store::int as "idStore", price FROM product_original_store_price WHERE id_product = $1`,
        params: [idProduct],
        transaction: transaction,
      });
      if (existingProduct.rows.length === 0) {
        throw new NotFoundException('Тип продукта не найден');
      }

      return {
        success: true,
        idProduct: idProduct,
        data: existingProduct.rows,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadGatewayException(
        `Ошибка при обновлении типов продуктов: ${error.message}`,
      );
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
  async delete(id: number) {
    try {
      const existingProduct = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id, id_product, image FROM products_original_test WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.TYPE, id],
      });

      if (existingProduct.rows.length === 0) {
        throw new NotFoundException('Тип продукта не найден');
      }

      const idProduct = existingProduct.rows[0].id_product;

      const currentImageUrl = existingProduct.rows[0].image;
      if (currentImageUrl && idProduct) {
        const bucketName = this.configService.get('S3_BUCKET_NAME');
        if (bucketName) {
          const urlParts = currentImageUrl.split('/');
          const urlFileName = urlParts[urlParts.length - 1];

          const basePath = `foodcourt/${S3_PATCH_ENUM.PACH_PRODUCT_ORIGINAL_IMAGE}/`;
          const fullPath = basePath + urlFileName;

          await this.s3Storage.deleteFile(bucketName, fullPath);
        }
      }

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.UPDATE,
        table_name: 'products_original_test',
        conflict: ['id'],
        columnUpdate: ['name', 'description', 'image', 'type', 'weight'],
        data: [
          {
            id: id,
            name: null,
            description: null,
            image: null,
            type: null,
            weight: null,
          },
        ],
      });

      if (!result || result.length === 0) {
        throw new BadRequestException('Тип продукта не был удален');
      }

      return {
        success: true,
        message: `Тип продукта ${id} успешно удален`,
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadGatewayException(
        `Ошибка при удалении типа продукта: ${error.message}`,
      );
    }
  }
}
