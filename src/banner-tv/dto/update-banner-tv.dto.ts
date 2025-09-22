import { PartialType } from '@nestjs/swagger';
import { CreateBannerTvDto } from './create-banner-tv.dto';

export class UpdateBannerTvDto extends PartialType(CreateBannerTvDto) {}
