import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersGateway,
    DatabaseService,
    {
      provide: 'ORDERS_GATEWAY_SETUP',
      useFactory: (
        ordersService: OrdersService,
        ordersGateway: OrdersGateway,
      ) => {
        // Устанавливаем связь между service и gateway
        ordersService.setGateway(ordersGateway);
        return true;
      },
      inject: [OrdersService, OrdersGateway],
    },
  ],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
