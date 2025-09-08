import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateGroupSubDto } from './dto/create-groups-sub.dto';
import { UpdateGroupSubDto } from './dto/groups-sub.dto';
import { DatabaseService } from '../../common/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '../../common/pg-connect/foodcord/orm/enum/metod.enum';

import { transformName } from '@/utils/transform-name';
import { PoolClient } from 'pg';

@Injectable()
export class GroupsSubService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createGroupSubDto: CreateGroupSubDto): Promise<{
    success: boolean;
    message: string;
  }> {
    let result = null;
    const NameGroup = transformName(createGroupSubDto.name);

    result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: 'SELECT name FROM groups_sub WHERE LOWER(name) = LOWER($1)',
      params: [NameGroup],
    });
    if (result && result.length > 0) {
      throw new ConflictException(
        'Ошибка при создании подгруппы: похожее название уже существует',
      );
    }
    try {
      result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.INSERT,
        table_name: 'groups_sub',
        conflict: ['name'],
        data: [createGroupSubDto],
      });

      if (!result && result.length === 0) {
        throw new UnprocessableEntityException('Ошибка при создании подгруппы');
      }
      return {
        success: true,
        message: `Подгруппа ${result[0].name}, успешно создана`,
      };
    } catch (error: any) {
      throw new BadGatewayException(error.message);
    }
  }

  async findAll() {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'SELECT id::int, name FROM groups_sub ORDER BY name DESC',
        params: [],
      });
      if (result.rows.length === 0) {
        throw new NotFoundException('Подгруппы не найдены');
      }
      return {
        success: true,
        data: result.rows,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении списка подгрупп: ${error.message}`,
      };
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: 'SELECT id::int, name FROM groups_sub WHERE id = $1',
        params: [id],
      });

      if (result.rows.length === 0) {
        throw new NotFoundException('Подгруппа не найдена');
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при получении подгруппы: ${error.message}`,
      };
    }
  }

  async update(id: number, updateGroupSubDto: UpdateGroupSubDto) {
    try {
      if (!updateGroupSubDto.name) {
        throw new BadRequestException('Название группы не может быть пустым');
      }
      const NameGroup = transformName(updateGroupSubDto.name);
      const existingGroup = await this.findOne(id);
      if (!existingGroup.success) {
        return existingGroup;
      }

      const result = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.UPDATE,
        table_name: 'groups_sub',
        conflict: ['id'],
        columnUpdate: ['name'],
        data: [{ id: id, name: NameGroup }],
      });

      if (!result && result.length === 0) {
        throw new UnprocessableEntityException(
          `Ошибка при обновлении подгруппы: ${NameGroup}`,
        );
      }
      return {
        success: true,
        message: 'Подгруппа успешно обновлена',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при обновлении подгруппы: ${error.message}`,
      };
    }
  }

  async remove(id: number) {
    try {
      const existingGroup = await this.findOne(id);
      if (!existingGroup.success) {
        throw new NotFoundException('Подгруппа не найдена');
      }
      const transaction: PoolClient =
        await this.databaseService.beginTransaction();
      try {
        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.QUERY,
          query: `UPDATE products_main 
                  SET subgroups = array_remove(subgroups, $1);`,
          params: [id],
          transaction: transaction,
        });

        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.DELETE,
          table_name: 'groups_sub',
          conflict: ['id'],
          data: [{ id }],
          transaction: transaction,
        });
        await this.databaseService.commitTransaction(transaction);
        return {
          success: true,
          message: 'Подгруппа удалена, связи с группами также удалены',
        };
      } catch (error: any) {
        await this.databaseService.rollbackTransaction(transaction);
        throw new BadGatewayException(error.message);
      } finally {
        await this.databaseService.releaseClient(transaction);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Ошибка при удалении подгруппы: ${error.message}`,
      };
    }
  }
}
