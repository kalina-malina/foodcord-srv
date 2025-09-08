import { PartialType } from '@nestjs/swagger';
import { CreateBannerLoyalityDto } from './create-banner-loyality.dto';

export class UpdateBannerLoyalityDto extends PartialType(
  CreateBannerLoyalityDto,
) {}
