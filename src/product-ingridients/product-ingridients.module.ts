import { Module } from '@nestjs/common';
import { ProductIngridientsService } from './product-ingridients.service';
import { ProductIngridientsController } from './product-ingridients.controller';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductIngridientsController],
  providers: [ProductIngridientsService, DatabaseService],
})
export class ProductIngridientsModule {}
