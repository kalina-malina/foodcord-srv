import { Module } from '@nestjs/common';

import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { AuthModule } from '@/auth/auth.module';
import { ProductExtrasController } from './product-extras.controller';
import { ProductExtrasService } from './product-extras.service';

@Module({
  imports: [AuthModule],
  controllers: [ProductExtrasController],
  providers: [ProductExtrasService, DatabaseService],
})
export class ProductExtrasModule {}
