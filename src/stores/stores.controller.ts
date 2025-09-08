import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('stores')
@ApiTags('Магазины')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({
    summary: 'Получение всех магазинов',
  })
  async findAll() {
    return await this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получение магазина по id',
  })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }
}
