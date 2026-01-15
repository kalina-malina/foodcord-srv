import { PartialType } from '@nestjs/swagger';
import { CreateProductMainAndStoreDto } from './create-product-main.dto';

export class UpdateProductMainDto extends PartialType(
  CreateProductMainAndStoreDto,
) {}
