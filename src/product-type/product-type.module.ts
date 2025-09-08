import { Module } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { ProductTypeController } from './product-type.controller';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductTypeController],
  providers: [ProductTypeService, DatabaseService],
})
export class ProductTypeModule {}
