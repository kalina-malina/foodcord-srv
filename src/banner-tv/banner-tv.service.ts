import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBannerTvDto } from './dto/create-banner-tv.dto';
import { UpdateBannerTvDto } from './dto/update-banner-tv.dto';
import { UploadPhotoService } from '@/s3/upload-photo';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { transformName } from '@/utils/transform-name';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { PoolClient } from 'pg';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';

@Injectable()
export class BannerTvService {
  constructor(
    private readonly databaseService: DatabaseService,
    private uploadPhotoService: UploadPhotoService,
  ) {}

  async create(createBannerTvDto: CreateBannerTvDto): Promise<{
    success: boolean;
    message: string;
  }> {
    let result = null;

    const NameBanner = transformName(createBannerTvDto.name);

    result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: 'SELECT name FROM banner_tv WHERE LOWER(name) = LOWER($1)',
      params: [NameBanner],
    });
    if (result && result.rows.length > 0) {
      throw new ConflictException(
        'Ошибка при создании баннера TV: похожее название уже существует',
      );
    }

    const { file, ...bannerData } = createBannerTvDto;
    void file;
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.INSERT,
        table_name: 'banner_tv',
        conflict: ['name'],
        data: [{ ...bannerData, name: NameBanner }],
        transaction: transaction,
      });
      if (result && result.length > 0) {
        let urlFile = null;
        if (createBannerTvDto.file) {
          const isVideo = createBannerTvDto.file.mimetype.startsWith('video/');
          const s3Path = isVideo
            ? S3_PATCH_ENUM.BANNER_TV_VIDEO
            : S3_PATCH_ENUM.BANNER_TV_IMAGE;

          urlFile = await this.uploadPhotoService.uploadPhoto(
            createBannerTvDto.file,
            s3Path,
            result[0].id,
          );

          result = await this.databaseService.executeOperation({
            operation: GRUD_OPERATION.UPDATE,
            table_name: 'banner_tv',
            conflict: ['id'],
            columnUpdate: ['url', 'type'],
            data: [
              {
                id: result[0].id,
                url: urlFile,
                type: isVideo ? 'video' : 'image',
              },
            ],
            transaction: transaction,
          });
        }

        await this.databaseService.commitTransaction(transaction);
        return {
          success: true,
          message: `Баннер ${result[0].name}, успешно создан`,
        };
      } else {
        throw new Error('Ошибка при создании баннера');
      }
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      throw new BadGatewayException(error.message);
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, name, url, type, seconds, store, is_active as "isActive", tv_number as "tvNumber", "create_at" as "createAt", "updated_at" as "updatedAt" FROM banner_tv ORDER BY id DESC',
        params: [],
      });
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении списка баннеров TV: ${error.message}`,
      };
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int, name, url, type, seconds, store, is_active as "isActive", tv_number as "tvNumber", "create_at" as "createAt", "updated_at" as "updatedAt" FROM banner_tv WHERE id = $1',
        params: [id],
      });
      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении баннера TV: ${error.message}`,
      };
    }
  }

  async update(id: number, updateBannerTvDto: UpdateBannerTvDto) {
    let result = null;
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();

    try {
      const existingBanner = await this.findOne(id);
      if (!existingBanner.success) {
        await this.databaseService.rollbackTransaction(transaction);
        throw new NotFoundException(existingBanner.message);
      }

      if (updateBannerTvDto.name) {
        const NameBanner = transformName(updateBannerTvDto.name);

        result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.QUERY,
          query:
            'SELECT name FROM banner_tv WHERE LOWER(name) = LOWER($1) AND id != $2',
          params: [NameBanner, id],
          transaction: transaction,
        });

        if (result && result.rows.length > 0) {
          await this.databaseService.rollbackTransaction(transaction);
          throw new ConflictException(
            'Баннер TV с таким названием уже существует',
          );
        }

        updateBannerTvDto.name = NameBanner;
      }
      const { file, ...updateData } = updateBannerTvDto;

      if (Object.keys(updateData).length > 0) {
        result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'banner_tv',
          conflict: ['id'],
          columnUpdate: ['name', 'seconds', 'is_active', 'store', 'tv_number'],
          data: [{ id, ...updateData }],
          transaction: transaction,
        });
      }
      if (file) {
        const isVideo = file.mimetype.startsWith('video/');
        const s3Path = isVideo
          ? S3_PATCH_ENUM.BANNER_TV_VIDEO
          : S3_PATCH_ENUM.BANNER_TV_IMAGE;

        const urlFile = await this.uploadPhotoService.uploadPhoto(
          file,
          s3Path,
          id.toString(),
        );

        result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'banner_tv',
          conflict: ['id'],
          columnUpdate: ['url', 'type'],
          data: [
            {
              id: id,
              url: urlFile,
              type: isVideo ? 'video' : 'image',
            },
          ],
          transaction: transaction,
        });
      }

      await this.databaseService.commitTransaction(transaction);
      return {
        success: true,
        data: result,
        message: 'Баннер TV успешно обновлен',
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      throw new BadGatewayException(error.message);
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async remove(id: number) {
    try {
      const existingBanner = await this.findOne(id);
      if (!existingBanner.success) {
        return existingBanner;
      }

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.DELETE,
        table_name: 'banner_tv',
        conflict: ['id'],
        data: [{ id }],
      });
      this.uploadPhotoService.deletePhotoByPath(result[0].url);

      return {
        success: true,
        message: 'Баннер TV успешно удален',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при удалении баннера TV: ${error.message}`,
      };
    }
  }
}
