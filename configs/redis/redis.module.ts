import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { RedisSessionService } from '../../src/auth/session/redis.session.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          socket: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),

            connectTimeout: 10000,
            keepAlive: true,
            reconnectStrategy: (retries) => {
              return Math.min(retries * 100, 5000);
            },
          },
          username: configService.getOrThrow<string>('REDIS_USER'),
          password: configService.getOrThrow<string>('REDIS_PASS'),
          database:
            configService.getOrThrow<string>('SERVER') === 'PROD' ? 4 : 4,
          pingInterval: 1000,
        });
        client.on('error', (err) => {
          void err;
          //console.error('Redis client error:', err); //TODO ДОБАВИТЬ ЛОГИРОВАИЕ
        });

        await client.connect();

        return client;
      },
      inject: [ConfigService], //зависимость
    },
    RedisService,
    RedisSessionService,
  ],
  exports: ['REDIS_CLIENT', RedisService, RedisSessionService],
})
export class RedisModule {}
