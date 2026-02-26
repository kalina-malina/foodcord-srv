import { Module } from '@nestjs/common';
import { DeviceCommunicationService } from './device-communication.service';
import { DeviceCommunicationController } from './device-communication.controller';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { DeviceCommunicationGateway } from './device-communication.gateway';

@Module({
  imports: [],
  controllers: [DeviceCommunicationController],
  providers: [
    DeviceCommunicationService,
    DeviceCommunicationGateway,
    DatabaseService,
    {
      provide: 'DEVICE_COMMUNICATION_GATEWAY_SETUP',
      useFactory: (
        deviceCommunicationService: DeviceCommunicationService,
        deviceCommunicationGateway: DeviceCommunicationGateway,
      ) => {
        deviceCommunicationService.setGateway(deviceCommunicationGateway);
        return true;
      },
      inject: [DeviceCommunicationService, DeviceCommunicationGateway],
    },
  ],
  exports: [DeviceCommunicationService, DeviceCommunicationGateway],
})
export class DeviceCommunicationModule {}
