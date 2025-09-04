/**
 * методы для записи обновления и удаления данных взаимодействия с базой данных
 */
import { Inject, Injectable } from '@nestjs/common';
import { GRUD_OPERATION } from './enum/metod.enum';
import { Pool, PoolClient } from 'pg';

export interface ExecuteQuery {
  transaction?: PoolClient;
  table_name?: string;
  data?: Array<{ [key: string]: any }>;
  conflict?: string[];
  columnUpdate?: string[];
  operation:
    | GRUD_OPERATION.DELETE
    | GRUD_OPERATION.INSERT
    | GRUD_OPERATION.INSERT_ON_UPDAETE
    | GRUD_OPERATION.UPDATE
    | GRUD_OPERATION.QUERY;
  id?: number;
  query?: string;
  params?: any[];
}

@Injectable()
export class DatabaseService {
  constructor(@Inject('DB_FOODCORD') private readonly pool: Pool) {}
  async executeOperation(options: ExecuteQuery) {
    const {
      operation,
      table_name,
      conflict,
      columnUpdate,
      data,
      query,
      params,
      transaction,
    } = options;

    let result: any;

    switch (operation) {
      case GRUD_OPERATION.QUERY:
        if (!query) {
          throw new Error('Для операции QUERY обязателен параметр query');
        }
        result = await this.selectQuery(query, params || [], transaction);
        break;

      case GRUD_OPERATION.INSERT_ON_UPDAETE:
        if (!table_name || !conflict || !columnUpdate || !data) {
          throw new Error(
            'Для операции INSERT_ON_UPDATE обязательны все параметры table_name  conflict  columnUpdate  data',
          );
        }
        result = await this.insertUpdateOperation(
          table_name,
          conflict,
          columnUpdate,
          data,
          transaction,
        );
        break;

      case GRUD_OPERATION.INSERT:
        if (!table_name || !conflict || !data) {
          throw new Error(
            'Для операции INSERT обязательны все параметры table_name  conflict  data',
          );
        }
        result = await this.insertOperation(
          table_name,
          conflict,
          data,
          transaction,
        );
        break;

      case GRUD_OPERATION.UPDATE:
        if (!table_name || !conflict || !columnUpdate || !data) {
          throw new Error(
            'Для операции UPDATE обязательны все параметры table_name  conflict  columnUpdate  data',
          );
        }
        result = await this.updateOperation(
          table_name,
          conflict,
          columnUpdate,
          data,
          transaction,
        );
        break;

      case GRUD_OPERATION.DELETE:
        if (!table_name || !conflict || !data) {
          throw new Error(
            'Для операции DELETE обязательны все параметры table_name  conflict  data',
          );
        }
        result = await this.deleteOperation(
          table_name,
          conflict,
          data,
          transaction,
        );
        break;

      default:
        throw new Error(`Не известная операция: ${operation}`);
    }

    return result;
  }

  /**
   * Начало транзакции
   */
  async beginTransaction() {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    return client;
  }

  /**
   * Подтверждение транзакции
   */
  async commitTransaction(client: any) {
    await client.query('COMMIT');
  }

  /**
   * Откат транзакции
   */
  async rollbackTransaction(client: any) {
    await client.query('ROLLBACK');
  }

  /**
   * Освобождение клиента
   */
  async releaseClient(client: any) {
    client.release();
  }

  /**
   * Метод выборки данных из базы данных
   * @param query - запрос
   * @param params - параметры запроса
   * @param transaction? - обьект подключения к базе в режиме транзакции
   */
  async selectQuery(
    query: string | undefined,
    params: any[],
    transaction: PoolClient | undefined,
  ): Promise<{
    success: boolean;
    rows: any[];
    rowCount: number;
    fields: any[];
    command: string;
  }> {
    try {
      if (!query) {
        throw new Error('Не был предан запрос');
      }
      const result = await (transaction || this.pool).query(query, params);

      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields || [],
        command: result.command,
      };
    } catch (error: any) {
      throw new Error(`Ошибка в методе selectQuery  ${error.message}`);
    }
  }

  /**
   * Метод обновдения и вставки в базу данных
   * @param table_name - название обновляемой таблицы
   * @param conflict - столбец конфликта
   * @param columnUpdate - столюцы которые хотим обновить
   * @param data - масив обьектов для обновлениея
   * @param transaction? - обьект подключения к базе в режиме транзакции
   * столбцы конфликта должны совпадать с ключами в обекте для обновления
   */
  private async insertUpdateOperation(
    table_name: string,
    conflict: string[],
    columnUpdate: string[],
    data: any[],
    transaction: PoolClient | undefined,
  ): Promise<{ insert: any; update: any }> {
    try {
      if (!table_name || !conflict || !columnUpdate || !data) {
        throw new Error('Для операции insertUpdate обязательны параметры');
      }
      const insertResults = [];
      const updateResults = [];
      for (const row of data) {
        const columns = Object.keys(row);
        const valuesPlaceholders = columns
          .map((_, index) => `$${index + 1}`)
          .join(', ');
        const conflictConditions = conflict
          .map((col, index) => `t.${col} = $${columns.length + index + 1}`)
          .join(' AND ');

        const insertQuery = `
                    INSERT INTO ${table_name} (${columns.join(', ')})
                    SELECT ${valuesPlaceholders}
                    WHERE NOT EXISTS (
                        SELECT 1 FROM ${table_name} t
                        WHERE ${conflictConditions}
                    ) 
                    RETURNING *;
                `;
        const insertValues = [
          ...columns.map((col) => row[col]),
          ...conflict.map((col) => row[col]),
        ];
        const result = await (transaction || this.pool).query(
          insertQuery,
          insertValues,
        );
        insertResults.push(...result.rows);
        if (result.rows.length > 0) {
          continue;
        }

        const updateExpressions = columnUpdate
          .map((col, index) => `${col} = $${index + 1}`)
          .join(', ');

        const whereClauses = conflict
          .map((col, index) => `${col} = $${columnUpdate.length + index + 1}`)
          .join(' AND ');

        const updateQuery = `
                    UPDATE ${table_name}
                    SET ${updateExpressions} , updated_at = NOW()
                    WHERE ${whereClauses}
                    RETURNING *;
                `;

        const updateValues = [
          ...columnUpdate.map((col) => row[col]),
          ...conflict.map((col) => row[col]),
        ];
        const updateResult = await (transaction || this.pool).query(
          updateQuery,
          updateValues,
        );
        updateResults.push(...updateResult.rows);
      }
      return {
        insert: insertResults.length,
        update: updateResults.length,
      };
    } catch (error: any) {
      throw new Error(`Ошибка в методе insertUpdate  ${error.message}`);
    }
  }
  /**
   * Метод только вставки новых данных буказанную таблицу
   * @param table_name - название обновляемой таблицы
   * @param conflict - столбец конфликта
   * @param columnUpdate - столюцы которые хотим обновить
   * @param data - масив обьектов для обновлениея
   * столбцы конфликта должны совпадать с ключами в обекте для обновления
   */
  private async insertOperation(
    table_name: string,
    conflict: string[],
    data: any[],
    transaction: PoolClient | undefined,
  ): Promise<any[]> {
    try {
      const results = [];
      for (const row of data) {
        const columns = Object.keys(row);
        const valuesPlaceholders = columns
          .map((_, index) => `$${index + 1}`)
          .join(', ');

        const conflictConditions = conflict
          .map((col, index) => `t.${col} = $${columns.length + index + 1}`)
          .join(' AND ');

        const insertQuery = `
                    INSERT INTO ${table_name} (${columns.join(', ')})
                    SELECT ${valuesPlaceholders}
                    WHERE NOT EXISTS (
                        SELECT 1 FROM ${table_name} t
                        WHERE ${conflictConditions}
                    ) RETURNING *;
                `;

        const insertValues = [
          ...columns.map((col) => row[col]),
          ...conflict.map((col) => row[col]),
        ];
        const result = await (transaction || this.pool).query(
          insertQuery,
          insertValues,
        );
        results.push(...result.rows);
      }
      return results;
    } catch (error: any) {
      throw new Error(`Ошибка в методе insert ${error.message}`);
    }
  }

  /**
   * Метод только обнолвения существующих данных в указанную таблицу
   * @param table_name - название обновляемой таблицы
   * @param conflict - столбец конфликта
   * @param columnUpdate - столюцы которые хотим обновить
   * @param data - масив обьектов для обновлениея
   * столбцы конфликта должны совпадать с ключами в обекте для обновления
   */

  private async updateOperation(
    table_name: string,
    conflict: string[],
    columnUpdate: string[],
    data: any[],
    transaction: PoolClient | undefined,
  ): Promise<any[]> {
    try {
      const results = [];
      for (const row of data) {
        const updateExpressions = columnUpdate
          .map((col, index) => `${col} = $${index + 1}`)
          .join(', ');

        const whereClauses = conflict
          .map((col, index) => `${col} = $${columnUpdate.length + index + 1}`)
          .join(' AND ');

        const updateQuery = ` UPDATE ${table_name}
                              SET ${updateExpressions} , updated_at = NOW()
                              WHERE ${whereClauses}
                              RETURNING *;
                            `;
        const values = [
          ...columnUpdate.map((col) => {
            const value = row[col];
            return typeof value === 'boolean' ? value : value;
          }),
          ...conflict.map((col) => row[col]),
        ];

        const result = await (transaction || this.pool).query(
          updateQuery,
          values,
        );
        results.push(...result.rows);
      }

      return results;
    } catch (error: any) {
      throw new Error(`Ошибка в методе update  ${error.message}`);
    }
  }

  /**
   * Метод удаления значений по указанным ключам из указанной таблицы
   * @param table_name - название обновляемой таблицы
   * @param conflict - столбец конфликта
   * @param columnUpdate - столюцы которые хотим обновить
   * @param data - масив обьектов для обновлениея
   * столбцы конфликта должны совпадать с ключами в обекте для обновления
   */

  private async deleteOperation(
    table_name: string,
    conflict: string[],
    data: any[],
    transaction: PoolClient | undefined,
  ): Promise<any[]> {
    try {
      const results = [];
      for (const row of data) {
        const whereClauses = conflict
          .map((col, index) => `${col} = $${index + 1}`)
          .join(' AND ');

        const deleteQuery = `
                    DELETE FROM ${table_name}
                    WHERE ${whereClauses}
                    RETURNING *;
                `;
        const deleteValues = conflict.map((col) => row[col]);

        const result = await (transaction || this.pool).query(
          deleteQuery,
          deleteValues,
        );
        results.push(...result.rows);
      }
      return results;
    } catch (error: any) {
      throw new Error(`Ошибка в методе delete`, error.message);
    }
  }
}
