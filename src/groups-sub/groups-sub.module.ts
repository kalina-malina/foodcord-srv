import { Module } from '@nestjs/common';
import { GroupsSubService } from './groups-sub.service';
import { GroupsSubController } from './groups-sub.controller';
import { DatabaseService } from '../../common/pg-connect/foodcord/orm/grud-postgres.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GroupsSubController],
  providers: [GroupsSubService, DatabaseService],
})
export class GroupsSubModule {}
