import { Module } from '@nestjs/common';
import { GroupOriginalService } from './group-original.service';
import { GroupOriginalController } from './group-original.controller';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupOriginalController],
  providers: [GroupOriginalService],
})
export class GroupOriginalModule {}
