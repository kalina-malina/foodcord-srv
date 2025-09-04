import { Module } from '@nestjs/common';
import { ProductIngredientService } from './product-ingredient.service';
import { ProductIngredientController } from './product-ingredient.controller';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';

@Module({
  controllers: [ProductIngredientController],
  providers: [ProductIngredientService, DatabaseService],
})
export class ProductIngredientModule {}
