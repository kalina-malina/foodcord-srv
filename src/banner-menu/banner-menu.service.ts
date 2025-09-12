import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '../../common/pg-connect/foodcord/orm/enum/metod.enum';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';
import { UploadPhotoService } from '@/s3/upload-photo';
import { PoolClient } from 'pg';
import { transformName } from '@/utils/transform-name';
import { CreateBannerMenuDto } from './dto/create-banner-menu.dto';
import { UpdateBannerMenuDto } from './dto/update-banner-menu.dto';

@Injectable()
export class BannerMenuService {
  constructor(
    private readonly databaseService: DatabaseService,
    private uploadPhotoService: UploadPhotoService,
  ) {}

  async create(createBannerMainDto: CreateBannerMenuDto): Promise<{
    success: boolean;
    message: string;
  }> {
    let result = null;

    const NameBanner = transformName(createBannerMainDto.name);

    result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: 'SELECT name FROM banner_menu WHERE LOWER(name) = LOWER($1)',
      params: [NameBanner],
    });
    if (result && result.rows.length > 0) {
      throw new ConflictException(
        'Ошибка при создании баннера меню: похожее название уже существует',
      );
    }

    const { file, ...bannerData } = createBannerMainDto;
    void file;
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();
    try {
      result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.INSERT,
        table_name: 'banner_menu',
        conflict: ['name'],
        data: [{ ...bannerData, name: NameBanner }],
        transaction: transaction,
      });
      if (result && result.length > 0) {
        let urlFile = null;
        if (createBannerMainDto.file) {
          const isVideo =
            createBannerMainDto.file.mimetype.startsWith('video/');
          const s3Path = isVideo
            ? S3_PATCH_ENUM.BANNER_MENU_VIDEO
            : S3_PATCH_ENUM.BANNER_MENU_IMAGE;

          urlFile = await this.uploadPhotoService.uploadPhoto(
            createBannerMainDto.file,
            s3Path,
            result[0].id,
          );

          result = await this.databaseService.executeOperation({
            operation: GRUD_OPERATION.UPDATE,
            table_name: 'banner_menu',
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
          'SELECT id::int,seconds,url, type FROM banner_menu ORDER BY id DESC',
        params: [],
      });
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении списка баннеров: ${error.message}`,
      };
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query:
          'SELECT id::int,seconds,url, type FROM banner_menu WHERE id = $1',
        params: [id],
      });

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Баннер не найден',
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении баннера: ${error.message}`,
      };
    }
  }

  async update(id: number, updateBannerMenuDto: UpdateBannerMenuDto) {
    let result = null;
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();

    try {
      const existingBanner = await this.findOne(id);
      if (!existingBanner.success) {
        await this.databaseService.rollbackTransaction(transaction);
        throw new NotFoundException(existingBanner.message);
      }

      if (updateBannerMenuDto.name) {
        const NameBanner = transformName(updateBannerMenuDto.name);

        result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.QUERY,
          query:
            'SELECT name FROM banner_menu WHERE LOWER(name) = LOWER($1) AND id != $2',
          params: [NameBanner, id],
          transaction: transaction,
        });

        if (result && result.rows.length > 0) {
          await this.databaseService.rollbackTransaction(transaction);
          throw new ConflictException(
            'Баннер меню с таким названием уже существует',
          );
        }

        updateBannerMenuDto.name = NameBanner;
      }
      const { file, ...updateData } = updateBannerMenuDto;

      if (Object.keys(updateData).length > 0) {
        result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'banner_menu',
          conflict: ['id'],
          columnUpdate: ['name', 'seconds', 'is_active', 'store'],
          data: [{ id, ...updateData }],
          transaction: transaction,
        });
      }
      if (file) {
        const isVideo = file.mimetype.startsWith('video/');
        const s3Path = isVideo
          ? S3_PATCH_ENUM.BANNER_MENU_VIDEO
          : S3_PATCH_ENUM.BANNER_MENU_IMAGE;

        const urlFile = await this.uploadPhotoService.uploadPhoto(
          file,
          s3Path,
          id.toString(),
        );

        result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.UPDATE,
          table_name: 'banner_menu',
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
        message: 'Баннер меню успешно обновлен',
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
        table_name: 'banner_menu',
        conflict: ['id'],
        data: [{ id }],
      });
      this.uploadPhotoService.deletePhotoByPath(result[0].url);

      return {
        success: true,
        message: 'Баннер меню успешно удален',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при удалении баннера меню: ${error.message}`,
      };
    }
  }
}
