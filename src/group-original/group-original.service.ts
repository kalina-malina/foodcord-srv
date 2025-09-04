import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';

@Injectable()
export class GroupOriginalService {
  constructor(private readonly databaseService: DatabaseService) {}
  async getAllGroups() {
    const query = `
      SELECT DISTINCT group_code, group_name FROM products_original
    `;
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: query,
    });
    return result.rows;
  }
}
