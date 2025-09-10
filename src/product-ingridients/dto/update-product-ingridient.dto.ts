import { PartialType } from '@nestjs/swagger';
import { CreateProductIngridientDto } from './create-product-ingridient.dto';

export class UpdateProductIngridientDto extends PartialType(
  CreateProductIngridientDto,
) {}
