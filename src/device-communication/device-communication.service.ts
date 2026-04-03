import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import {
  CreateCodeDto,
  CreateCodeResponseDto,
  FindCodeDto,
  FindCodeResponseDto,
  FindTvCodeDto,
  InitTvPairingByTokenDto,
  QueryIdStoreResultDto,
  RegisterTvCodeDto,
} from './dto/create-code.dto';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class DeviceCommunicationService {
  private deviceCommunicationGateway: any;
  private readonly logger = new Logger(DeviceCommunicationService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}
  setGateway(gateway: any) {
    this.deviceCommunicationGateway = gateway;
  }
  generateFourDigitCode(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }

  private tvPairRedisKey(token: string) {
    return `tv_pair_token:${token.trim()}`;
  }

  private tvPairTtlSec() {
    return Number(this.configService.get('TV_PAIR_TOKEN_TTL_SEC') ?? 86400);
  }

  /** Убедиться, что в device_communication есть строка с этим code (без id_store). */
  private async ensureDeviceCommunicationRow(
    code: number,
  ): Promise<{ ok: boolean }> {
    const transaction = await this.databaseService.beginTransaction();
    try {
      const exists = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `Select 1 from device_communication where code = $1`,
        params: [code],
        transaction,
      });
      if (exists.rows.length === 0) {
        await this.databaseService.executeOperation({
          operation: GRUD_OPERATION.INSERT,
          table_name: 'device_communication',
          conflict: ['code'],
          data: [{ code }],
          transaction,
        });
      }
      const after = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `Select 1 from device_communication where code = $1`,
        params: [code],
        transaction,
      });
      if (after.rows.length === 0) {
        await this.databaseService.rollbackTransaction(transaction);
        return { ok: false };
      }
      await this.databaseService.commitTransaction(transaction);
      return { ok: true };
    } catch (e) {
      await this.databaseService.rollbackTransaction(transaction);
      this.logger.error(`ensureDeviceCommunicationRow: ${e}`);
      return { ok: false };
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  private async pickUnusedRandomCode(): Promise<number | null> {
    for (let i = 0; i < 80; i++) {
      const code = this.generateFourDigitCode();
      const q = await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `Select 1 from device_communication where code = $1`,
        params: [code],
      });
      if (q.rows.length === 0) {
        return code;
      }
    }
    return null;
  }

  /**
   * Одинаковый token с нескольких ТВ → один и тот же code (Redis SET NX).
   * Дальше: WebSocket join_pairing_room(String(code)), планшет один раз find-one-tv-pad.
   */
  async initTvPairingByToken(
    dto: InitTvPairingByTokenDto,
  ): Promise<CreateCodeResponseDto> {
    const token = dto.token.trim();
    if (!token) {
      throw new BadRequestException({ message: 'Токен не может быть пустым' });
    }
    const redisKey = this.tvPairRedisKey(token);
    const ttl = this.tvPairTtlSec();

    let code = await this.redisService.get<number>(redisKey);
    if (code !== null) {
      await this.redisService.setTtl(redisKey, JSON.stringify(code), ttl);
      const { ok } = await this.ensureDeviceCommunicationRow(code);
      if (!ok) {
        return { message: 'Не удалось подготовить код в БД', code: 0 };
      }
      return { message: 'Код сессии', code };
    }

    const preferred = dto.code;
    let candidate =
      preferred ?? (await this.pickUnusedRandomCode());
    if (candidate === null) {
      return { message: 'Не удалось выделить свободный код', code: 0 };
    }

    const created = await this.redisService.setTtlNx(
      redisKey,
      JSON.stringify(candidate),
      ttl,
    );
    if (!created) {
      code = await this.redisService.get<number>(redisKey);
      if (code === null) {
        return { message: 'Ошибка сессии сопряжения', code: 0 };
      }
      await this.redisService.setTtl(redisKey, JSON.stringify(code), ttl);
      const { ok } = await this.ensureDeviceCommunicationRow(code);
      if (!ok) {
        return { message: 'Не удалось подготовить код в БД', code: 0 };
      }
      return { message: 'Код сессии', code };
    }

    const { ok } = await this.ensureDeviceCommunicationRow(candidate);
    if (!ok) {
      await this.redisService.del(redisKey);
      return { message: 'Не удалось зарегистрировать код', code: 0 };
    }
    return { message: 'Код сессии создан', code: candidate };
  }

  /**
   * ТВ объявляет код (клиентский или согласованный между экранами).
   * Одна строка device_communication на code — все ТВ с этим code получают store_assigned после find-one-tv-pad.
   */
  async registerTvCode(
    dto: RegisterTvCodeDto,
  ): Promise<CreateCodeResponseDto> {
    const { ok } = await this.ensureDeviceCommunicationRow(dto.code);
    if (!ok) {
      return { message: 'Не удалось зарегистрировать код', code: 0 };
    }
    return {
      message: 'Код зарегистрирован',
      code: dto.code,
    };
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
        query: `Select
         dc.id_store as "idStore",  
         s.name as "nameStore"
         from device_communication as dc
         left join stores as s on s.id_store = dc.id_store
          where code = $1`,
        params: [findCodeDto.code],
        transaction: transaction,
      })) as QueryIdStoreResultDto;
      if (result.rows.length === 0) {
        throw new Error('Код не найден');
      }
      return {
        message: 'Номер магазина получен',
        idStore: result.rows[0]?.idStore!,
        nameStore: result.rows[0]?.nameStore!,
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
        idStore: 0,
        nameStore: '',
      };
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }

  async findOneTvToPad(findTvCodeDto: FindTvCodeDto) {
    if (!findTvCodeDto.code) {
      throw new BadRequestException({ message: 'Поле code обязательно' });
    }
    try {
      const result = (await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `Select id_store as "idStore" from device_communication where code = $1`,
        params: [findTvCodeDto.code],
      })) as QueryIdStoreResultDto;
      if (result.rows.length === 0) {
        throw new BadRequestException({
          message:
            'Код не найден. Сначала откройте сессию на ТВ (tv-pairing-by-token, tv-register-code или tv-generate-code).',
        });
      }
      if (this.deviceCommunicationGateway) {
        this.deviceCommunicationGateway.sendIdStoreToMessage(
          findTvCodeDto.code,
          findTvCodeDto.idStore,
        );
      }
      return { message: 'Магазин отправлен на ТВ' };
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      const errorStack = e instanceof Error ? e.stack : undefined;
      this.logger.error('findOneTvToPad', errorStack || String(e));
      throw new BadRequestException({
        message: 'Не удалось привязать магазин по коду',
      });
    }
  }

  async deleteAll() {
    const transaction = await this.databaseService.beginTransaction();
    try {
      const codeList = (await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.QUERY,
        query: `
        SELECT code
        FROM
            device_communication
        
        `,
        params: [],
      })) as { rows: { code: number }[] };
      const codeListNumber = codeList.rows.map((row) => ({ code: row.code }));
      await this.databaseService.executeOperation({
        operation: GRUD_OPERATION.DELETE,
        table_name: 'device_communication',
        conflict: ['code'],
        data: codeListNumber,
      });
      this.databaseService.commitTransaction(transaction);
    } catch (error) {
      await this.databaseService.rollbackTransaction(transaction);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        'Не получилось удалить созданные коды',
        errorStack || String(error),
      );
    } finally {
      await this.databaseService.releaseClient(transaction);
    }
  }
}
