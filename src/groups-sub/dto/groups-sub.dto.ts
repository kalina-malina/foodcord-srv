import { PartialType } from '@nestjs/swagger';
import { CreateGroupSubDto } from './create-groups-sub.dto';

export class UpdateGroupSubDto extends PartialType(CreateGroupSubDto) {}
