import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('role')
@UseGuards(JwtAuthGuard)
@ApiTags('Типы продуктов')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все роли' })
  async getRole() {
    return this.roleService.getRole();
  }
}
