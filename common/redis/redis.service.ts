import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  async set<T>(key: string, value: T): Promise<void> {
    await this.redisClient.set(
      `${process.env.REDIS_USER}:${key}`,
      JSON.stringify(value),
    );
  }

  async setTtl(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.redisClient.set(`${process.env.REDIS_USER}:${key}`, value, {
      EX: ttl,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.redisClient.get(
      `${process.env.REDIS_USER}:${key}`,
    );
    if (result) {
      return JSON.parse(result) as T;
    }
    return null;
  }
  async del_array(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    await this.redisClient.del(keys);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(`${process.env.REDIS_USER}:${key}`);
  }
}
