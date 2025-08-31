import { Module } from '@nestjs/common';
import { DatabaseService } from './grud-postgres.service';

@Module({
  imports: [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
