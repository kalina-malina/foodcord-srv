import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { DatabaseService } from '../../common/pg-connect/foodcord/orm/grud-postgres.service';
import { S3Module } from '@/s3/s3.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [S3Module, AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService, DatabaseService],
})
export class GroupsModule {}
