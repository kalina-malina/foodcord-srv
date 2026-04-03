import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Logger,
  Delete,
} from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceCommunicationService } from './device-communication.service';
import {
  CreateCodeDto,
  FindTvCodeDto,
  InitTvPairingByTokenDto,
  RegisterTvCodeDto,
} from './dto/create-code.dto';

@Controller('device-communication')
@ApiTags('Коммуникация с устройством')
export class DeviceCommunicationController {
  private readonly logger = new Logger(DeviceCommunicationController.name);

  constructor(
    private readonly deviceCommunicationService: DeviceCommunicationService,
  ) {}

  @Post('terminal-generate-code')
  @ApiOperation({ summary: 'Создание кода для терминала' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async createTerminalCode(@Body() createCodeDto: CreateCodeDto) {
    return await this.deviceCommunicationService.createCode(createCodeDto);
  }

  @Get('tv-generate-code')
  @ApiOperation({
    summary: 'ТВ: сервер выдаёт случайный 4-значный код',
  })
  @ApiResponse({ status: 201, description: 'Код создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async createTvCode() {
    return await this.deviceCommunicationService.createCode({});
  }

  @Post('tv-pairing-by-token')
  @ApiOperation({
    summary:
      'ТВ: один token → один code на все экраны. Ответ показать на ТВ; join_pairing_room(code). Планшет один раз find-one-tv-pad',
  })
  @ApiResponse({ status: 201, description: 'Код сессии' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async initTvPairingByToken(@Body() body: InitTvPairingByTokenDto) {
    return await this.deviceCommunicationService.initTvPairingByToken(body);
  }

  @Post('tv-register-code')
  @ApiOperation({
    summary:
      'ТВ без token: зарегистрировать код вручную (несколько ТВ — один code; join_pairing_room)',
  })
  @ApiResponse({ status: 201, description: 'Код зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async registerTvCode(@Body() body: RegisterTvCodeDto) {
    return await this.deviceCommunicationService.registerTvCode(body);
  }

  @Get('find-one-terminal-pad/:code')
  @ApiOperation({ summary: 'Получение планшетом номера магазина' })
  async findOneTerminalPad(@Param('code') code: number) {
    return await this.deviceCommunicationService.findOneTerminalToPad({
      code: code,
    });
  }

  @Post('find-one-tv-pad')
  @ApiOperation({
    summary: 'Планшет: привязка ТВ по коду и idStore; событие store_assigned в комнате code_*',
  })
  async findOneTvPad(@Body() body: FindTvCodeDto) {
    return await this.deviceCommunicationService.findOneTvToPad(body);
  }

  @Delete('delete-all-codes')
  @ApiOperation({ summary: 'Удаление всех кодов (служебное)' })
  async deleteAllCode() {
    return await this.deviceCommunicationService.deleteAll();
  }
}
