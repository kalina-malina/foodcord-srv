import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { SearchStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query:
        'SELECT id_store::int as id, name, city,region FROM stores ORDER BY name ASC',
    });
    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query:
        'SELECT id_store::int as id, name, city,region FROM stores WHERE id_store = $1',
      params: [id],
    });
    return result.rows[0];
  }

  async findStoresPerParams(searchStoreDto: SearchStoreDto) {
    const { city, region, idStore } = searchStoreDto;

    // Начинаем с базового запроса
    let query = `
      SELECT 
        id_store::int as id, name, city,region
      FROM stores 
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Фильтр по городам
    if (city && city.length > 0) {
      query += ` AND city = ANY($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }

    // Фильтр по регионам
    if (region && region.length > 0) {
      query += ` AND region = ANY($${paramIndex})`;
      params.push(region);
      paramIndex++;
    }

    // Фильтр по ID магазинов
    if (idStore && idStore.length > 0) {
      query += ` AND id_store = ANY($${paramIndex})`;
      params.push(idStore);
      paramIndex++;
    }

    const result = (await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query,
      params,
    })) as { rows: { idStore: number }[] };

    const ids: number[] = result.rows.map((row) => row.idStore);

    return { idStore: ids };
  }
}
