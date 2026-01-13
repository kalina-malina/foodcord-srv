import { Controller, Post, Body, Param, Get, Logger } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceCommunicationService } from './device-communication.service';
import { CreateCodeDto, FindTvCodeDto } from './dto/create-code.dto';

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
  @ApiOperation({ summary: 'Создание кода для телевизора' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async createTvCode() {
    return await this.deviceCommunicationService.createCode({});
  }

  @Get('find-one-terminal-pad/:code')
  @ApiOperation({ summary: 'Получение планшетом номера магазина' })
  async findOneTerminalPad(@Param('code') code: number) {
    return await this.deviceCommunicationService.findOneTerminalToPad({
      code: code,
    });
  }

  @Post('find-one-tv-pad')
  @ApiOperation({ summary: 'Получением телевизором номера магазина' })
  async findOneTvPad(@Body() body: FindTvCodeDto) {
    return await this.deviceCommunicationService.findOneTvToPad(body);
  }
}
