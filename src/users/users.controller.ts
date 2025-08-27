import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDTO } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(@Body() createUser: createUserDTO) {
    return await this.usersService.createUser(createUser);
  }
}
