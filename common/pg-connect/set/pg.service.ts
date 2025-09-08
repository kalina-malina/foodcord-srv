import { Pool, PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export interface DbAuth extends Pool {}

export class SetFactory {
  logger = new Logger(SetFactory.name);
  private static pool: Pool | null = null;
  private static readonly logger = new Logger(SetFactory.name);

  static createPool(configService: ConfigService): DbAuth {
    if (this.pool) {
      return this.pool as DbAuth;
    }
    const safeParseInt = (value: any, defaultValue: number): number => {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      const parsed = parseInt(value.toString(), 10);
      return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
    };

    const config: PoolConfig = {
      host: configService.get('DB_SET_HOST') || 'localhost',
      port: safeParseInt(configService.get('DB_AUTH_PORT'), 5432),
      database: configService.get('DB_SET_NAME'),
      user: configService.get('DB_SET_USER'),
      password: configService.get('DB_SET_PASSWORD'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    this.pool = new Pool(config);
    return this.pool as DbAuth;
  }

  async queryRows<T = any>(
    pool: Pool,
    sql: string,
    params?: any[],
  ): Promise<T[]> {
    const result = await pool.query(sql, params);
    return result.rows;
  }

  static async testConnection(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.pool?.options?.database;
      return true;
    } catch (error: any) {
      this.logger.error(`Нет подклбчения к базе данных: ${error.message}`);
      return false;
    }
  }

  static async shutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
