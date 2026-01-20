import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeviceCommunicationService } from '../device-communication.service';

@Injectable()
export class DeviceCommunicationCronService {
  private readonly logger = new Logger(DeviceCommunicationCronService.name);

  constructor(
    private readonly deviceCommunicationService: DeviceCommunicationService,
  ) {}

  /**
   * каждый день в 2:00 утра
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleUpdateAllProducts() {
    this.logger.log('Удаление сохранённых кодов для устройств');

    try {
      await this.deviceCommunicationService.deleteAll();

      this.logger.log('Удаление кодов для устройств завершено');
    } catch (error) {
      this.logger.error('Ошибка удалении кодов устройств:', error);
    }
  }
}
