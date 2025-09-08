import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
