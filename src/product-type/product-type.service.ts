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
import { ConfigService } from '@nestjs/config';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';

@Injectable()
export class ProductTypeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly s3Storage: S3StorageService,
    private readonly configService: ConfigService,
  ) {}
  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int,  name_original as name,image FROM products_original WHERE type = $1',
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
          'SELECT id::int, name_original as name, image FROM products_original WHERE type = $1 AND id = $2',
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

  async delete(id: number) {
    try {
      const existingProduct = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id, id_product, image FROM products_original WHERE type = $1 AND id = $2',
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
        table_name: 'products_original',
        conflict: ['id'],
        columnUpdate: [
          'name',
          'description',
          'image',
          'price',
          'type',
          'weight',
        ],
        data: [
          {
            id: id,
            name: null,
            description: null,
            image: null,
            price: 0,
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
