import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupsSubService } from './groups-sub.service';
import { CreateGroupSubDto } from './dto/create-groups-sub.dto';
import { UpdateGroupSubDto } from './dto/groups-sub.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('groups-sub')
@ApiTags('Подгруппы(теги в меню)')
export class GroupsSubController {
  constructor(private readonly groupsService: GroupsSubService) {}

  @Post('create')
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
  @ApiOperation({ summary: 'Обновить подгруппу(теги в меню) по id' })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupSubDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить подгруппу(теги в меню) по id' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
