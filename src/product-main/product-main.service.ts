import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductMainDto } from './dto/create-product-main.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { S3StorageService } from '@/s3/storage.service';
import { ConfigService } from '@nestjs/config';
import { PoolClient } from 'pg';
import sharp from 'sharp';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';

@Injectable()
export class ProductMainService {
  constructor(
    private readonly databaseService: DatabaseService,
    private s3Storage: S3StorageService,
    private configService: ConfigService,
  ) {}

  async create(createProductMainDto: CreateProductMainDto): Promise<{
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
      !ingredients
    ) {
      return {
        message: 'Не все поля заполнены',
      };
    }
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.INSERT,
        table_name: 'products_main',
        conflict: ['name'],
        columnUpdate: [
          'name',
          'variant',
          'description',
          'groups',
          'subgroups',
          'ingredients',
          'composition',
          'fats',
          'proteins',
          'carbohydrates',
          'calories',
        ],
        transaction: transaction,
        data: [
          {
            name,
            variant: variant,
            description,
            groups,
            subgroups,

            ingredients,
            composition,
            fats,
            proteins,
            carbohydrates,
            calories,
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
          table_name: 'products_main',
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
      throw new BadRequestException('Продукт не создан ' + error.message);
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
              ) FILTER (WHERE po.id IS NOT NULL),
              '[]'::jsonb
          ) AS groups,
          COALESCE(
              ARRAY_AGG(DISTINCT po.name) FILTER (WHERE po.id IS NOT NULL),
              '{}'::text[]
          ) AS subgroup,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', ext.id,
                      'name', ext.name,
                      'price', ext.price
                  )
              ) FILTER (WHERE ext.id IS NOT NULL),
              '[]'::jsonb
          ) AS extras,
            COALESCE(
              ARRAY_AGG(DISTINCT ing.name) FILTER (WHERE ing.id IS NOT NULL),
              '{}'::text[]
          ) AS ingredients,
          COALESCE(
              JSONB_AGG(
                  DISTINCT JSONB_BUILD_OBJECT(
                      'id', typ.id,
                      'name', typ.name,
                      'price', typ.price,
                      'weight', typ.weight
                  )
              ) FILTER (WHERE typ.id IS NOT NULL),
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
      FROM products_main pm
      LEFT JOIN groups po ON po.id = ANY(pm.groups)
      LEFT JOIN products_original typ ON po.id = ANY(pm.groups) and typ.type = 'type'
      LEFT JOIN products_original ext ON po.id = ANY(pm.groups) and ext.type = 'extras'
      LEFT JOIN products_main inf ON inf.id = pm.id
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

  async remove(id: number) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `DELETE FROM products_main WHERE id = ${id}`,
    });
    if (result.length === 0) {
      throw new BadRequestException('Продукт не найден');
    }
    return {
      message: `Продукт ${id} успешно удален`,
    };
  }
}
