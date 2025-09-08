import { Module } from '@nestjs/common';
import { GroupOriginalService } from './group-original.service';
import { GroupOriginalController } from './group-original.controller';
import { DatabaseModule } from '@/pg-connect/foodcord/orm/grud-postgres.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [GroupOriginalController],
  providers: [GroupOriginalService],
})
export class GroupOriginalModule {}
