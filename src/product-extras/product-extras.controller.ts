import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageOptions } from '@/s3/multer.config';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ProductExtrasService } from './product-extras.service';
import { UpdateProductExtrasDto } from './dto/update-product-extras.dto';

@Controller('product-extras')
@ApiTags('Дополнительные продукты')
@UseGuards(JwtAuthGuard)
export class ProductExtrasController {
  constructor(private readonly productExtrasService: ProductExtrasService) {}
  @ApiOperation({ summary: 'Получить все дополнительные продукты' })
  @Get()
  findAll() {
    return this.productExtrasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить дополнительный продукт по id' })
  findOne(@Param('id') id: string) {
    return this.productExtrasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить дополнительный продукт по id' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  update(
    @Param('id') id: string,
    @Body() updateProductExtrasDto: UpdateProductExtrasDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateProductExtrasDto.image = file;
    }
    return this.productExtrasService.update(+id, updateProductExtrasDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить допы продукта' })
  async delete(@Param('id') id: number) {
    return await this.productExtrasService.delete(id);
  }
}
