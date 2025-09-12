import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, DatabaseService],
})
export class OrdersModule {}
