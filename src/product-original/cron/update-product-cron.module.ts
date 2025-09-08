import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UpdateProductAllCron } from './update-product-all';
import { SetDatabaseModule } from 'common/pg-connect/set/pg.module';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SetDatabaseModule, // Для DB_SET
    DatabaseModule, // Для DatabaseService
  ],
  providers: [UpdateProductAllCron],
  exports: [UpdateProductAllCron],
})
export class ProductCronModule {}
