import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DatabaseService } from '../../common/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '../../common/pg-connect/foodcord/orm/enum/metod.enum';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';
import { UploadPhotoService } from '@/s3/upload-photo';
import { PoolClient } from 'pg';
import { transformName } from '@/utils/transform-name';

@Injectable()
export class GroupsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private uploadPhotoService: UploadPhotoService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<{
    success: boolean;
    message: string;
  }> {
    let result = null;

    const NameGroup = transformName(createGroupDto.name);
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();

    result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: 'SELECT name FROM groups WHERE LOWER(name) = LOWER($1)',
      params: [NameGroup],
      transaction: transaction,
    });
    if (result && result.length > 0) {
      throw new ConflictException(
        'Ошибка при создании группы: похожее название уже существует',
      );
    }
    try {
      result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.INSERT,
        table_name: 'groups',
        conflict: ['name'],
        data: [createGroupDto],
        transaction: transaction,
      });
      if (result && result.length > 0) {
        let urlImage = null;
        if (createGroupDto.image) {
          urlImage = await this.uploadPhotoService.uploadPhoto(
            createGroupDto.image,
            S3_PATCH_ENUM.PACH_GROUP_IMAGE,
            result[0].id,
          );
          result = await this.databaseService.executeOperation({
            operation: GRUD_OPERATION.UPDATE,
            table_name: 'groups',
            conflict: ['id'],
            columnUpdate: ['image'],
            data: [{ id: result[0].id, image: urlImage }],
            transaction: transaction,
          });
        }
      } else {
        throw new Error('Ошибка при создании группы: название');
      }

      if (result && result.length > 0) {
        await this.databaseService.commitTransaction(transaction);
        return {
          success: true,
          message: `Группа ${result[0].name}, успешно создана`,
        };
      } else {
        throw new Error('Ошибка при создании группы: Фото');
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
        query: 'SELECT id::int, name, image FROM groups ORDER BY name DESC',
        params: [],
      });
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении списка групп: ${error.message}`,
      };
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'SELECT id::int, name, image FROM groups WHERE id = $1',
        params: [id],
      });

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Группа не найдена',
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении группы: ${error.message}`,
      };
    }
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    try {
      let columnUpdate = [];
      if (!updateGroupDto.name) {
        return {
          success: false,
          message: 'Название группы не может быть пустым',
        };
      }
      const NameGroup = transformName(updateGroupDto.name);
      const existingGroup = await this.findOne(id);
      if (!existingGroup.success) {
        return existingGroup;
      }
      let urlImage = null;
      if (updateGroupDto.image) {
        urlImage = await this.uploadPhotoService.uploadPhoto(
          updateGroupDto.image,
          S3_PATCH_ENUM.PACH_GROUP_IMAGE,
          id.toString(),
        );
      }
      if (urlImage) {
        columnUpdate = ['image', 'name'];
      } else {
        columnUpdate = ['name'];
      }

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.UPDATE,
        table_name: 'groups',
        conflict: ['id'],
        columnUpdate: columnUpdate,
        data: [{ id: id, image: urlImage, name: NameGroup }],
      });

      if (result && result.length > 0) {
        return {
          success: true,
          message: 'Группа успешно обновлена',
        };
      } else {
        throw new Error(`Ошибка при обновлении группы: ${NameGroup}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при обновлении группы: ${error.message}`,
      };
    }
  }

  async remove(id: number) {
    const existingGroup = await this.findOne(id);
    if (!existingGroup.success) {
      return existingGroup;
    }
    const transaction: PoolClient =
      await this.databaseService.beginTransaction();

    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.DELETE,
        table_name: 'groups',
        conflict: ['id'],
        data: [{ id }],
        transaction: transaction,
      });

      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `UPDATE products_main 
                  SET groups = array_remove(groups, $1);`,
        params: [id],
        transaction: transaction,
      });
      await this.databaseService.commitTransaction(transaction);
      const deletePhoto = await this.uploadPhotoService.deletePhoto(
        S3_PATCH_ENUM.PACH_GROUP_IMAGE,
        id.toString(),
      );
      return {
        success: true,
        data: result,
        message:
          'группа удалена' +
          (deletePhoto ? 'с фото' : 'Но фотография не удалена'),
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      return {
        success: false,
        message: `Ошибка при удалении группы: ${error.message}`,
      };
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
}
