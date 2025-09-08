import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDTO } from './dto/create-user.dto';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Пользователи')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Создание нового пользователя' })
  async createUser(@Body() createUser: createUserDTO) {
    return await this.usersService.createUser(createUser);
  }
}
