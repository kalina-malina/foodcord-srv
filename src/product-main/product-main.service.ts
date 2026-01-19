import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateProductMainAndStoreDto } from './dto/create-product-main.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { S3StorageService } from '@/s3/storage.service';
import { ConfigService } from '@nestjs/config';
import { PoolClient } from 'pg';
import sharp from 'sharp';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';
import { UpdateProductMainDto } from './dto/update-product-main.dto';

@Injectable()
export class ProductMainService {
  constructor(
    private readonly databaseService: DatabaseService,
    private s3Storage: S3StorageService,
    private configService: ConfigService,
  ) {}

  async create(createProductMainDto: CreateProductMainAndStoreDto): Promise<{
    message: string;
  }> {
    const {
      name,
      variant,
      groups,
      subgroups,

      ingredients,
      description,
      image,
      composition,
      fats,
      proteins,
      carbohydrates,
      calories,
      type,
      color,
      extras,
      idStore,
    } = createProductMainDto;

    if (
      !name ||
      !variant ||
      !description ||
      !image ||
      !composition ||
      !fats ||
      !proteins ||
      !carbohydrates ||
      !calories ||
      !groups ||
      !subgroups ||
      !ingredients ||
      !type ||
      !color ||
      !extras ||
      !idStore
    ) {
      return {
        message: 'Не все поля заполнены',
      };
    }
    const id_store = idStore;
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      //проверка сушествования в базе названия
      const checkName = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `SELECT id FROM products_main_test WHERE lower(name) = lower('${name}')`,
      });
      if (checkName.length > 0) {
        throw new ConflictException('Название продукта уже существует');
      }

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.INSERT,
        table_name: 'products_main_test',
        conflict: ['name'],
        columnUpdate: [
          'name',
          'variant',
          'description',
          'groups',
          'subgroups',
          'ingredients',
          'type',
          'color',
          'extras',
          'composition',
          'fats',
          'proteins',
          'carbohydrates',
          'calories',
          'id_store',
        ],
        transaction: transaction,
        data: [
          {
            name,
            variant: variant,
            description,
            groups,
            subgroups,
            type,
            color,
            extras,
            ingredients,
            composition,
            fats,
            proteins,
            carbohydrates,
            calories,
            id_store,
          },
        ],
      });
      if (result && result.length > 0) {
        let urlImage = null;
        if (createProductMainDto.image) {
          const bucketName = this.configService.get('S3_BUCKET_NAME');
          if (!bucketName) {
            throw new Error('Отсутствуют настройки S3');
          }
          const basePath = `foodcourt/${S3_PATCH_ENUM.BANNER_MAIN_IMAGE}/`;

          const fileName = `${result[0].id}.webp`;

          await this.s3Storage.deleteFile(bucketName, basePath + fileName);

          const coverWebpBuffer = await sharp(createProductMainDto.image.buffer)
            .webp({ quality: 90, lossless: true })
            .toBuffer();

          await this.s3Storage.uploadFile(
            bucketName,
            basePath + fileName,
            coverWebpBuffer,
            'image/webp',
          );
          urlImage = `https://${this.configService.get('S3_BUCKET_ID')}.selstorage.ru/${basePath}${fileName}`;
        }

        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'products_main_test',
          conflict: ['id'],
          columnUpdate: ['image'],
          transaction: transaction,
          data: [{ id: +result[0].id, image: urlImage }],
        });

        await this.databaseService.commitTransaction(transaction);
        return {
          message: `Продукт ${name} успешно создан с id ${result[0].id}`,
        };
      }

      throw new BadRequestException('Продукт не создан');
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      throw new BadRequestException(error.message);
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async findAll() {
    const query = `
         SELECT
          pm.id::int,
          pm.name,
          pm.image,
          pm.variant,
          pm.color,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', po.id,
                      'name', po.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS groups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', gsub.id,
                      'name', gsub.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS subgroups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', ext.id_product,
                      'name', ext.name,
                      'price', etype.price,
                      'image', ext.image,
                      'weight', ext.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS extras,
            COALESCE(
              JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
                      'id', ing.id,
                      'name', ing.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS ingredients,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', typ.id_product,
                      'name', typ.name,
                      'price', ptype.price,
                      'weight', typ.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS type,
              JSONB_BUILD_OBJECT(
              'composition', pm.composition,
              'description', pm.description,
              'fats', pm.fats::numeric,
              'proteins', pm.proteins::numeric,
              'carbohydrates', pm.carbohydrates::numeric,
              'calories', pm.calories::numeric
          ) AS information,
           pm.id_store::int[] as "IdStore"
      FROM products_main_test pm
      LEFT JOIN groups po ON po.id = ANY(pm.groups)
      LEFT JOIN groups_sub gsub ON gsub.id = ANY(pm.subgroups)
      LEFT JOIN products_original typ ON typ.id = ANY(pm.type) and typ.type = 'type'
      LEFT JOIN products_original ext ON ext.id = ANY(pm.extras) and ext.type = 'extras'
      LEFT JOIN product_original_store_price ptype on typ.id_product = ptype.id_product and ptype.id_store = ANY(pm.id_store)
      LEFT JOIN product_original_store_price etype on ext.id_product = etype.id_product and etype.id_store = ANY(pm.id_store)
      LEFT JOIN products_main_test inf ON inf.id = pm.id
      LEFT JOIN products_ingredients ing ON ing.id = ANY(pm.ingredients)
      GROUP BY
          pm.id, pm.name, pm.image, pm.composition, pm.description,
          pm.fats, pm.proteins, pm.carbohydrates, pm.calories,
          pm.variant, pm.groups, pm.subgroups;
    `;

    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: query,
    });

    if (result.length === 0) {
      throw new BadRequestException('Продукт не найден');
    }

    return result.rows;
  }

  async findAllPerStore(idStore: number) {
    const query = `
         SELECT
          pm.id::int,
          pm.name,
          pm.image,
          pm.variant,
          pm.color,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', po.id,
                      'name', po.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS groups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', gsub.id,
                      'name', gsub.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS subgroups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', ext.id_product,
                      'name', ext.name,
                      'price', etype.price,
                      'image', ext.image,
                      'weight', ext.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS extras,
            COALESCE(
              JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
                      'id', ing.id,
                      'name', ing.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS ingredients,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', typ.id_product,
                      'name', typ.name,
                      'price', ptype.price,
                      'weight', typ.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS type,
              JSONB_BUILD_OBJECT(
              'composition', pm.composition,
              'description', pm.description,
              'fats', pm.fats::numeric,
              'proteins', pm.proteins::numeric,
              'carbohydrates', pm.carbohydrates::numeric,
              'calories', pm.calories::numeric
          ) AS information
      FROM products_main_test pm
      LEFT JOIN groups po ON po.id = ANY(pm.groups)
      LEFT JOIN groups_sub gsub ON gsub.id = ANY(pm.subgroups)
      LEFT JOIN products_original_test typ ON typ.id = ANY(pm.type) and typ.type = 'type'
      LEFT JOIN products_original_test ext ON ext.id = ANY(pm.extras) and ext.type = 'extras'
      LEFT JOIN product_original_store_price ptype on typ.id_product = ptype.id_product and ptype.id_store = ANY(pm.id_store)
      LEFT JOIN product_original_store_price etype on ext.id_product = etype.id_product and etype.id_store = ANY(pm.id_store)
      LEFT JOIN products_main_test inf ON inf.id = pm.id
      LEFT JOIN products_ingredients ing ON ing.id = ANY(pm.ingredients)
      where $1 = ANY(pm.id_store)
      and ptype.price is not null
      GROUP BY
          pm.id, pm.name, pm.image, pm.composition, pm.description,
          pm.fats, pm.proteins, pm.carbohydrates, pm.calories,
          pm.variant, pm.groups, pm.subgroups;
    `;

    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: query,
      params: [idStore],
    });

    if (result.length === 0) {
      throw new BadRequestException('Продукт не найден');
    }

    return result.rows;
  }

  async findOne(id: number) {
    const query = `
         SELECT
          pm.id::int,
          pm.name,
          pm.image,
          pm.variant,
          pm.color,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', po.id,
                      'name', po.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS groups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', gsub.id,
                      'name', gsub.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS subgroups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', ext.id_product,
                      'name', ext.name,
                      'image', ext.image,
                      'weight', ext.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS extras,
            COALESCE(
              JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
                      'id', ing.id,
                      'name', ing.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS ingredients,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', typ.id_product,
                      'name', typ.name,
                      'weight', typ.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS type,
              JSONB_BUILD_OBJECT(
              'composition', pm.composition,
              'description', pm.description,
              'fats', pm.fats::numeric,
              'proteins', pm.proteins::numeric,
              'carbohydrates', pm.carbohydrates::numeric,
              'calories', pm.calories::numeric
          ) AS information
      FROM products_main_test pm
      LEFT JOIN groups po ON po.id = ANY(pm.groups)
      LEFT JOIN groups_sub gsub ON gsub.id = ANY(pm.subgroups)
      LEFT JOIN products_original typ ON typ.id = ANY(pm.type) and typ.type = 'type'
      LEFT JOIN products_original ext ON ext.id = ANY(pm.extras) and ext.type = 'extras'
      
      LEFT JOIN products_main_test inf ON inf.id = pm.id
      LEFT JOIN products_ingredients ing ON ing.id = ANY(pm.ingredients)
      WHERE pm.id = $1
      GROUP BY
          pm.id, pm.name, pm.image, pm.composition, pm.description,
          pm.fats, pm.proteins, pm.carbohydrates, pm.calories,
          pm.variant, pm.groups, pm.subgroups;
    `;

    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: query,
      params: [id],
    });

    if (result.length === 0) {
      throw new BadRequestException('Продукт не найден');
    }

    return result.rows[0];
  }

  async findOnePerStore(id: number, idStore: number) {
    const query = `
         SELECT
          pm.id::int,
          pm.name,
          pm.image,
          pm.variant,
          pm.color,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', po.id,
                      'name', po.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS groups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', gsub.id,
                      'name', gsub.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS subgroups,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', ext.id_product,
                      'name', ext.name,
                      'price', etype.price,
                      'image', ext.image,
                      'weight', ext.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS extras,
            COALESCE(
              JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
                      'id', ing.id,
                      'name', ing.name
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS ingredients,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', typ.id_product,
                      'name', typ.name,
                      'price', ptype.price,
                      'weight', typ.weight
                  )
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::jsonb
          ) AS type,
              JSONB_BUILD_OBJECT(
              'composition', pm.composition,
              'description', pm.description,
              'fats', pm.fats::numeric,
              'proteins', pm.proteins::numeric,
              'carbohydrates', pm.carbohydrates::numeric,
              'calories', pm.calories::numeric
          ) AS information
      FROM products_main_test pm
      LEFT JOIN groups po ON po.id = ANY(pm.groups)
      LEFT JOIN groups_sub gsub ON gsub.id = ANY(pm.subgroups)
      LEFT JOIN products_original typ ON typ.id = ANY(pm.type) and typ.type = 'type'
      LEFT JOIN products_original ext ON ext.id = ANY(pm.extras) and ext.type = 'extras'
      LEFT JOIN product_original_store_price ptype on typ.id_product = ptype.id_product and ptype.id_store = ANY(pm.id_store)
      LEFT JOIN product_original_store_price etype on ext.id_product = etype.id_product and etype.id_store = ANY(pm.id_store)
      LEFT JOIN products_main_test inf ON inf.id = pm.id
      LEFT JOIN products_ingredients ing ON ing.id = ANY(pm.ingredients)
      WHERE pm.id = $1
      and $2 = ANY(pm.id_store)
      and ptype.price is not null 
      GROUP BY
          pm.id, pm.name, pm.image, pm.composition, pm.description,
          pm.fats, pm.proteins, pm.carbohydrates, pm.calories,
          pm.variant, pm.groups, pm.subgroups;
    `;

    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: query,
      params: [id, idStore],
    });

    if (result.length === 0) {
      throw new BadRequestException('Продукт не найден');
    }

    return result.rows[0];
  }

  async remove(id: number) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `DELETE FROM products_main_test WHERE id = ${id}`,
    });
    if (result.length === 0) {
      throw new BadRequestException('Продукт не найден');
    }
    return {
      message: `Продукт ${id} успешно удален`,
    };
  }

  async update(id: number, dto: UpdateProductMainDto) {
    const existingProduct = await this.findOne(id);

    const transaction: PoolClient =
      await this.databaseService.beginTransaction();

    try {
      const currentImageUrl = existingProduct.image;
      const { image, ...updateData } = dto;
      const dbUpdateData = {
        ...updateData,
        id_store: updateData.idStore,
      };

      if (Object.keys(updateData).length > 0) {
        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'products_main_test',
          conflict: ['id'],
          columnUpdate: [
            'name',
            'description',
            'variant',
            'groups',
            'subgroups',
            'ingredients',
            'type',
            'extras',
            'composition',
            'fats',
            'proteins',
            'carbohydrates',
            'calories',
            'color',
            'id_store',
          ],
          data: [{ id, ...dbUpdateData }],
          transaction: transaction,
        });
      }

      if (image) {
        if (currentImageUrl) {
          const bucketName = this.configService.get('S3_BUCKET_NAME');
          if (bucketName && currentImageUrl.includes(bucketName)) {
            const urlParts = currentImageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const basePath = `foodcourt/${S3_PATCH_ENUM.BANNER_MAIN_IMAGE}/`;

            await this.s3Storage.deleteFile(bucketName, basePath + fileName);
          }
        }

        const bucketName = this.configService.get('S3_BUCKET_NAME');
        if (!bucketName) {
          throw new Error('Отсутствуют настройки S3');
        }

        const basePath = `foodcourt/${S3_PATCH_ENUM.BANNER_MAIN_IMAGE}/`;
        const fileName = `${id}.webp`;

        const coverWebpBuffer = await sharp(image.buffer)
          .webp({ quality: 90, lossless: true })
          .toBuffer();

        await this.s3Storage.uploadFile(
          bucketName,
          basePath + fileName,
          coverWebpBuffer,
          'image/webp',
        );

        const newImageUrl = `https://${this.configService.get('S3_BUCKET_ID')}.selstorage.ru/${basePath}${fileName}`;

        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'products_main_test',
          conflict: ['id'],
          columnUpdate: ['image'],
          transaction: transaction,
          data: [{ id, image: newImageUrl }],
        });
      }

      await this.databaseService.commitTransaction(transaction);
      return {
        message: `Продукт ${id} успешно обновлен`,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      throw new BadRequestException(error.message);
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async updateProductPerStore(
    id: number,
    idStore: number,
    dto: UpdateProductMainDto,
  ) {
    const existingProduct = await this.findOnePerStore(id, idStore);

    const transaction: PoolClient =
      await this.databaseService.beginTransaction();

    try {
      const currentImageUrl = existingProduct.image;

      const { image, ...updateData } = dto;

      if (Object.keys(updateData).length > 0) {
        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'products_main_test',
          conflict: ['id'],
          columnUpdate: [
            'name',
            'description',
            'variant',
            'groups',
            'subgroups',
            'ingredients',
            'type',
            'extras',
            'composition',
            'fats',
            'proteins',
            'carbohydrates',
            'calories',
            'color',
          ],
          data: [{ id, ...updateData }],
          transaction: transaction,
        });
      }

      if (image) {
        if (currentImageUrl) {
          const bucketName = this.configService.get('S3_BUCKET_NAME');
          if (bucketName && currentImageUrl.includes(bucketName)) {
            const urlParts = currentImageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const basePath = `foodcourt/${S3_PATCH_ENUM.BANNER_MAIN_IMAGE}/`;

            await this.s3Storage.deleteFile(bucketName, basePath + fileName);
          }
        }

        const bucketName = this.configService.get('S3_BUCKET_NAME');
        if (!bucketName) {
          throw new Error('Отсутствуют настройки S3');
        }

        const basePath = `foodcourt/${S3_PATCH_ENUM.BANNER_MAIN_IMAGE}/`;
        const fileName = `${id}.webp`;

        const coverWebpBuffer = await sharp(image.buffer)
          .webp({ quality: 90, lossless: true })
          .toBuffer();

        await this.s3Storage.uploadFile(
          bucketName,
          basePath + fileName,
          coverWebpBuffer,
          'image/webp',
        );

        const newImageUrl = `https://${this.configService.get('S3_BUCKET_ID')}.selstorage.ru/${basePath}${fileName}`;

        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'products_main_test',
          conflict: ['id'],
          columnUpdate: ['image'],
          transaction: transaction,
          data: [{ id, image: newImageUrl }],
        });
      }

      await this.databaseService.commitTransaction(transaction);
      return {
        message: `Продукт ${id} успешно обновлен`,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      throw new BadRequestException(error.message);
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
}
