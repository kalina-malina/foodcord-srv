import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { TYPE_PRODUCT_ENUM } from '@/product-original/enum/type-prodict.enum';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '@/s3/storage.service';
import { UpdateProductExtrasDto } from './dto/update-product-extras.dto';
import { UploadPhotoService } from '@/s3/upload-photo';
import { PoolClient } from 'pg';

@Injectable()
export class ProductExtrasService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly s3Storage: S3StorageService,
    private readonly uploadPhotoService: UploadPhotoService,
  ) {}
  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, id_product::int as "idProduct", name_original as name, description, weight::int,  type, image FROM products_original WHERE type = $1',
        params: [TYPE_PRODUCT_ENUM.EXTRAS],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException('дополнительные продукты не найдены');
      }
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при получении дополнительных продуктов: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, id_product::int as "idProduct",name_original as name, description, weight::int,  type, image FROM products_original WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.EXTRAS, id],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException(' не найден');
      }
      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      throw new BadGatewayException(
        `ошибка при получении дополнительного продукта: ${error.message}`,
      );
    }
  }

  async update(id: number, updateProductExtrasDto: UpdateProductExtrasDto) {
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      const existingProduct = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id, name_original, description, image, weight FROM products_original WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.EXTRAS, id],
        transaction: transaction,
      });

      if (existingProduct.rows.length === 0) {
        throw new NotFoundException('Дополнительный продукт не найден');
      }

      const { name, description, weight, image, type } = updateProductExtrasDto;

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
          table_name: 'products_original',
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
            table_name: 'products_original',
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
        message: `Дополнительный продукт ${id} успешно обновлен`,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadGatewayException(
        `Ошибка при обновлении дополнительного продукта: ${error.message}`,
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
          'SELECT id, id_product, image FROM products_original WHERE type = $1 AND id = $2',
        params: [TYPE_PRODUCT_ENUM.EXTRAS, id],
      });

      if (existingProduct.rows.length === 0) {
        throw new NotFoundException('Дополнительный продукт не найден');
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
        throw new BadRequestException('Дополнительный продукт не был удален');
      }

      return {
        success: true,
        message: `Дополнительный продукт ${id} успешно удален`,
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadGatewayException(
        `Ошибка при удалении дополнительного продукта: ${error.message}`,
      );
    }
  }
}
