import { PartialType } from '@nestjs/swagger';
import { CreateBannerMenuDto } from './create-banner-menu.dto';

export class UpdateBannerMenuDto extends PartialType(CreateBannerMenuDto) {}
