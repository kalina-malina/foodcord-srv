import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupsSubService } from './groups-sub.service';
import { CreateGroupSubDto } from './dto/create-groups-sub.dto';
import { UpdateGroupSubDto } from './dto/groups-sub.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';

@Controller('groups-sub')
@ApiTags('Подгруппы(теги в меню)')
export class GroupsSubController {
  constructor(private readonly groupsService: GroupsSubService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Создание подгруппы(теги в меню)',
  })
  create(@Body() createGroupDto: CreateGroupSubDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все подгруппы(теги в меню)' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить подгруппу(теги в меню) по id' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновить подгруппу(теги в меню) по id' })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupSubDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить подгруппу(теги в меню) по id' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
