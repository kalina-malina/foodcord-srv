import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import {
  CreateCodeDto,
  CreateCodeResponseDto,
  FindCodeDto,
  FindCodeResponseDto,
  FindTvCodeDto,
  QueryIdStoreResultDto,
} from './dto/create-code.dto';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';

@Injectable()
export class DeviceCommunicationService {
  private deviceCommunicationGateway: any;
  private readonly logger = new Logger(DeviceCommunicationService.name);
  constructor(private readonly databaseService: DatabaseService) {}
  setGateway(gateway: any) {
    this.deviceCommunicationGateway = gateway;
  }
  generateFourDigitCode(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }
  async createCode(
    createCodeDto: CreateCodeDto,
  ): Promise<CreateCodeResponseDto> {
    const transaction = await this.databaseService.beginTransaction();
    try {
      let code: number;
      let FindCode = false;
      while (!FindCode) {
        code = this.generateFourDigitCode();
        const result = await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.QUERY,
          query: `Select * from device_communication where code = $1`,
          params: [code],
          transaction: transaction,
        });
        if (result.rows.length === 0) {
          FindCode = true;
          let resultFinal: any;
          if (createCodeDto.idStore) {
            resultFinal = await this.databaseService.executeOperation({
              operation: GRUD_OPERATION.INSERT,
              table_name: 'device_communication',
              conflict: ['code'],
              data: [{ code: code, id_store: createCodeDto.idStore }],
              transaction: transaction,
            });
          } else {
            resultFinal = await this.databaseService.executeOperation({
              operation: GRUD_OPERATION.INSERT,
              table_name: 'device_communication',
              conflict: ['code'],
              data: [{ code: code }],
              transaction: transaction,
            });
          }
          if (resultFinal.length > 0) {
            await this.databaseService.commitTransaction(transaction);
            return {
              message: 'Код успешно создан',
              code: code,
            };
          }
        }
      }
      return {
        message: 'Код не найден',
        code: 0,
      };
    } catch (error: any) {
      await this.databaseService.rollbackTransaction(transaction);
      this.logger.error(`Произошла ошибка при создании кода: ${error}`);
      return {
        message: 'Ошибка при создании заказа',
        code: 0,
      };
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async findOneTerminalToPad(
    findCodeDto: FindCodeDto,
  ): Promise<FindCodeResponseDto> {
    if (!findCodeDto.code) {
      throw new Error('Поле code не должно быть пустым!');
    }
    const transaction = await this.databaseService.beginTransaction();
    try {
      const result = (await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `Select id_store as "idStore" from device_communication where code = $1`,
        params: [findCodeDto.code],
        transaction: transaction,
      })) as QueryIdStoreResultDto;
      if (result.rows.length === 0) {
        throw new Error('Код не найден');
      }
      return {
        message: 'Номер магазина получен',
        idStore: result.rows[0]?.idStore!,
        success: true,
      };
    } catch (error) {
      await this.databaseService.rollbackTransaction(transaction);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        'Failed to create/store device communication code',
        errorStack || String(error),
      );

      return {
        success: false,
        message:
          'Не удалось найти код связи планшет-терминал. Попробуйте позже.',
      };
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async findOneTvToPad(findTvCodeDto: FindTvCodeDto) {
    if (!findTvCodeDto.code) {
      throw new Error('Поле code не должно быть пустым!');
    }
    const transaction = await this.databaseService.beginTransaction();
    try {
      const result = (await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `Select id_store as "idStore" from device_communication where code = $1`,
        params: [findTvCodeDto.code],
        transaction: transaction,
      })) as QueryIdStoreResultDto;
      if (result.rows.length === 0) {
        throw new Error('Код не найден');
      }
      if (this.deviceCommunicationGateway) {
        this.deviceCommunicationGateway.sendIdStoreToMessage(
          findTvCodeDto.code,
          findTvCodeDto.idStore,
        );
      }
    } catch (error) {
      await this.databaseService.rollbackTransaction(transaction);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        'Failed to create/store device communication code',
        errorStack || String(error),
      );
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
  async updateStatus() {}
  async deleteOne() {}
  async deleteAll() {}
}
