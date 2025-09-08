import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  Query,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ProductOriginslService } from './product.service';
import { UpdateProductOriginslDto } from './dto/update-product.dto';
import { UpdateProductAllCron } from './cron/update-product-all';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { multerImageOptions } from '@/s3/multer.config';
import {
  ResponseProductOriginalDto,
  ResponseUpdateInfoProductOriginalDto,
  ResponseUpdateProductOriginalDto,
} from './dto/response-product-original.dto';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';

@ApiTags('Продукты из сетретейл ')
@Controller('product-original')
@UseGuards(JwtAuthGuard)
export class ProductOriginslController {
  constructor(
    private readonly productOriginslService: ProductOriginslService,
    private readonly updateProductAllCron: UpdateProductAllCron,
  ) {}

  @Get('update-product-set')
  @ApiOperation({ summary: 'Обновление продуктов из сетритейла' })
  @ApiResponse({ type: ResponseUpdateProductOriginalDto })
  async updateProductAll() {
    return await this.updateProductAllCron.getAllOriginslProducts();
  }

  @Get()
  @ApiOperation({
    summary: 'Получение списка продуктов для редактирование',
  })
  @ApiResponse({ type: ResponseProductOriginalDto })
  async getProductForEdit(@Query('groupCode') groupCode: string) {
    return await this.productOriginslService.getProductForEdit(groupCode);
  }

  @Post('update-product/:idProduct')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductOriginslDto })
  @ApiResponse({ type: ResponseUpdateInfoProductOriginalDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], multerImageOptions),
  )
  @ApiOperation({
    summary:
      'Обновление типа продукта название фото описание для отображения на устройстве',
  })
  async updateProductOriginal(
    @Param('idProduct') idProduct: string,
    @Body() createProductDto: UpdateProductOriginslDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      createProductDto.image = files.image[0];
    }
    return await this.productOriginslService.updateProductOriginal(
      +idProduct,
      createProductDto,
    );
  }
}
