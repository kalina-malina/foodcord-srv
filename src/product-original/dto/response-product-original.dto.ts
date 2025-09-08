import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class ResponseProductOriginalDto {
  @ApiProperty({ description: 'ID продукта(нередактируемое поле)' })
  id_product: number;
  @ApiProperty({ description: 'Название продукта(нередактируемое поле)' })
  name_original: string;
  @ApiProperty({ description: 'Единица измерения(нередактируемое поле)' })
  ed: string;
  @ApiProperty({ description: 'ERP код(нередактируемое поле)' })
  erpcode: string;
  @ApiProperty({
    description: 'Удален(нередактируемое поле) хз что не факт что достоверно',
  })
  deleted: string;
  @ApiProperty({ description: 'Группа(нередактируемое поле)' })
  group_code: string;
  @ApiProperty({ description: 'Ставка НДС(нередактируемое поле)' })
  vat: number;
  @ApiProperty({ description: 'Группа оригинальная(нередактируемое поле)' })
  group_name: string;
  @ApiProperty({ description: 'Фотография' })
  image: string;
  @ApiProperty({ description: 'Описание' })
  description: string;
  @ApiProperty({ description: 'Название для ля отображения на устройстве' })
  name: string;
}

class ResponseUpdateProductMessageDTO {
  @ApiProperty({ description: 'Новые продукты' })
  insert: any;
  @ApiProperty({ description: 'Обновленные продукты' })
  update: any;
}

export class ResponseUpdateProductOriginalDto {
  @ApiProperty({ description: 'Сообщение' })
  @IsString()
  @IsNotEmpty()
  message: string;
  @ApiProperty({
    description: 'Индификаторы обновленный и или новых продуктов',
  })
  @IsArray()
  @IsNotEmpty()
  operation: ResponseUpdateProductMessageDTO;
}

export class ResponseUpdateInfoProductOriginalDto {
  @ApiProperty({ description: 'Сообщение' })
  @IsString()
  @IsNotEmpty()
  message: string;
  @ApiProperty({
    description: 'Индификаторы обновленных продуктов',
  })
  @IsArray()
  @IsNotEmpty()
  result: number[] | [];
}
