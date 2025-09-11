import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateProductOriginslDto } from './dto/update-product.dto';
import { DatabaseService } from '@/pg-connect/foodcord/orm/grud-postgres.service';
import { GRUD_OPERATION } from '@/pg-connect/foodcord/orm/enum/metod.enum';
import { S3_PATCH_ENUM } from '@/s3/enum/s3.pach.enum';
import { UploadPhotoService } from '@/s3/upload-photo';
import { TYPE_PRODUCT_ENUM } from './enum/type-prodict.enum';

@Injectable()
export class ProductOriginslService {
  constructor(
    private readonly databaseService: DatabaseService,
    private uploadPhotoService: UploadPhotoService,
  ) {}

  //* Получение продуктов для редактирования
  async getProductForEdit(groupCode: string) {
    let filtersGroups = ``;

    if (groupCode) {
      filtersGroups = ` AND group_code = '${groupCode}'`;
    }
    const query = `
      SELECT id_product::int, name_original,ed, erpcode, deleted,
      group_code, vat::int, group_name, image, description, name
      FROM products_original
      WHERE 1=1 ${filtersGroups}
    `;
    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.QUERY,
      query: query,
    });
    return result.rows;
  }

  async updateProductOriginal(
    idProduct: number,
    createProductDto: UpdateProductOriginslDto,
  ) {
    if (
      !createProductDto.weight &&
      createProductDto.type === TYPE_PRODUCT_ENUM.TYPE
    ) {
      throw new BadRequestException(
        'Вес продукта не может быть пустым для создания типа продукта',
      );
    }

    let urlImage = null;
    if (createProductDto.image) {
      urlImage = await this.uploadPhotoService.uploadPhoto(
        createProductDto.image,
        S3_PATCH_ENUM.PACH_PRODUCT_ORIGINAL_IMAGE,
        idProduct.toString(),
      );
    }

    const result = await this.databaseService.executeOperation({
      operation: GRUD_OPERATION.UPDATE,
      table_name: 'products_original',
      conflict: ['id_product'],
      columnUpdate: [
        'id_product',
        'image',
        'description',
        'name',
        'price',
        'type',
        'weight',
      ],
      data: [
        {
          id_product: idProduct,
          image: urlImage,
          description: createProductDto.description,
          name: createProductDto.name,
          price: createProductDto.price,
          type: createProductDto.type,
          weight: createProductDto.weight,
        },
      ],
    });

    if (!result || result.length === 0) {
      return {
        message: 'Ничего не обновлено',
        result: [],
      };
    }

    const sendResponse = result.map((item: any) => +item.id_product);
    return {
      message: 'Обновлено',
      result: sendResponse,
    };
  }
}
