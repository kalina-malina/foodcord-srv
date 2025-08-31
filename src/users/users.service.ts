import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createUserDTO } from './dto/create-user.dto';
import { generateSecurePassword } from './utils/generate-pass.utils';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'configs/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from 'configs/pg-connect/foodcord/orm/enum/metod.enum';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async createUser(user: createUserDTO) {
    const userResult = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `SELECT 1 FROM users WHERE email = $1 LIMIT 1`,
      params: [user.email],
    });
    if (userResult.rows.length > 0) {
      throw new NotFoundException({
        auth: false,
        message: 'Пользователь уже существует',
      });
    }

    const password = await generateSecurePassword();
    const passwordHash = await bcrypt.hash(password, 0);

    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: `
      INSERT INTO users (email, id_store,role, password_hash, last_name, first_name, middle_name, locked )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email,role, last_name, first_name, middle_name;
    `,
      params: [
        user.email,
        user.id_store,
        user.role,
        passwordHash,
        user.last_name,
        user.first_name,
        user.middle_name,
        false,
      ],
    });

    if (result.rows.length > 0) {
      return {
        auth: true,
        message: `Пользователь пользователь создан ${password}`,
      };
    } else {
      throw new BadRequestException({
        auth: false,
        message: 'Ошибка при создаии пользователя',
      });
    }
  }
}
