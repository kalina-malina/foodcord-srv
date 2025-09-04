import { PartialType } from '@nestjs/swagger';
import { CreateGroupOriginalDto } from './create-group-original.dto';

export class UpdateGroupOriginalDto extends PartialType(
  CreateGroupOriginalDto,
) {}
