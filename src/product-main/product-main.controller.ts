import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ProductMainService } from './product-main.service';
import { CreateProductMainDto } from './dto/create-product-main.dto';

import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerImageOptions } from '@/s3/multer.config';
import { ResponseProductMainDto } from './dto/response-product-main.dto';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';

@ApiTags('Продукты для отображения на устройстве')
@Controller('product-main')
@UseGuards(JwtAuthGuard)
export class ProductMainController {
  constructor(private readonly productMainService: ProductMainService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiOperation({
    summary: 'Создание продукта для отображения на устройстве',
  })
  async create(
    @Body() createProductMainDto: CreateProductMainDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      createProductMainDto.image = files.image[0];
    }
    return this.productMainService.create(createProductMainDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получение списка продуктов для отображения на устройстве',
  })
  @ApiResponse({ type: ResponseProductMainDto })
  async findAll() {
    return await this.productMainService.findAll();
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateProductMainDto: UpdateProductMainDto,
  // ) {
  //   return this.productMainService.update(+id, updateProductMainDto);
  // }

  // @Delete(':id')
  // @ApiOperation({
  //   summary: 'Удаление продукта ',
  // })
  // remove(@Param('id') id: string) {
  //   return this.productMainService.remove(+id);
  // }
}
