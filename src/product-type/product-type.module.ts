import { Module } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { ProductTypeController } from './product-type.controller';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  controllers: [ProductTypeController],
  providers: [ProductTypeService, DatabaseService],
})
export class ProductTypeModule {}
