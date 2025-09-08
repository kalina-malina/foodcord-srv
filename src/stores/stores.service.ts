import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';

@Injectable()
export class StoresService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query:
        'SELECT id_store::int, name, city,region FROM stores ORDER BY name ASC',
    });
    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query:
        'SELECT id_store::int, name, city,region FROM stores WHERE id_store = $1',
      params: [id],
    });
    return result.rows[0];
  }
}
