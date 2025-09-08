import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SetFactory } from './pg.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DB_SET',
      useFactory: async (configService: ConfigService) => {
        const pool = SetFactory.createPool(configService);
        await SetFactory.testConnection();
        return pool;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DB_SET'],
})
export class SetDatabaseModule {}
