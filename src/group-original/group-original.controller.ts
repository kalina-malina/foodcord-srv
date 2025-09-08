import { Controller, Get, UseGuards } from '@nestjs/common';
import { GroupOriginalService } from './group-original.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('group-original')
@ApiTags('Группы продуктов из сетретейл')
@UseGuards(JwtAuthGuard)
export class GroupOriginalController {
  constructor(private readonly groupOriginalService: GroupOriginalService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все группы продуктов из сетретейл' })
  async getAllGroups() {
    return await this.groupOriginalService.getAllGroups();
  }
}
