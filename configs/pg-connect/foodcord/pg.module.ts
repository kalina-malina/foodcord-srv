import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresFactory } from './pg.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DB_AUTH',
      useFactory: async (configService: ConfigService) => {
        const pool = PostgresFactory.createPool(configService);
        await PostgresFactory.testConnection();
        return pool;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DB_AUTH'],
})
export class PgModule {}
