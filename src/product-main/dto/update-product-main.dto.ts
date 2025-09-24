import { PartialType } from '@nestjs/swagger';
import { CreateProductMainDto } from './create-product-main.dto';

export class UpdateProductMainDto extends PartialType(CreateProductMainDto) {}