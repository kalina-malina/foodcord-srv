import { Controller, Get } from '@nestjs/common';
import { GroupOriginalService } from './group-original.service';

@Controller('group-original')
export class GroupOriginalController {
  constructor(private readonly groupOriginalService: GroupOriginalService) {}

  @Get()
  async getAllGroups() {
    return await this.groupOriginalService.getAllGroups();
  }
}
