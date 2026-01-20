import { Module } from '@nestjs/common';
import { DeviceCommunicationModule } from '../device-communication.module';
import { DeviceCommunicationCronService } from './device-communication-cron.service';

@Module({
  imports: [DeviceCommunicationModule],
  providers: [DeviceCommunicationCronService],
  exports: [DeviceCommunicationCronService],
})
export class DeviceCommunicationCronModule {}
