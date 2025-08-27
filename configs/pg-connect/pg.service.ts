import { Pool, PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { addTableAuth } from './create/create-table.sql';

export interface DbAuth extends Pool {}

export class PostgresFactory {
  logger = new Logger(PostgresFactory.name);
  private static pool: Pool | null = null;
  private static readonly logger = new Logger(PostgresFactory.name);

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

    const isDev = configService.get('NODE_ENV') !== 'production';
    const config: PoolConfig = {
      host: configService.get('DB_AUTH_HOST') || 'localhost',
      port: safeParseInt(configService.get('DB_AUTH_PORT'), 5432),
      database: isDev
        ? 'foodcord'
        : configService.get('DB_AUTH_NAME') || 'auth',
      user: configService.get('DB_AUTH_USER') || 'postgres',
      password: configService.get('DB_AUTH_PASSWORD') || '',
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

  static async initAuthTables(): Promise<any> {
    if (!this.pool) {
      false;
    } else {
      try {
        const client = await this.pool.connect();
        await client.query(addTableAuth);
        client.release();
        return true;
      } catch (err) {
        this.logger.error('Ошибка при создании таблиц auth:', err);
        return false;
      }
    }
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
