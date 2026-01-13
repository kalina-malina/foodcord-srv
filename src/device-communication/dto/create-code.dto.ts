import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCodeDto {
  @ApiProperty({ description: 'ID магазина' })
  @IsNumber()
  @IsOptional()
  idStore?: number;
}

export class CreateCodeTvDto {
  @ApiProperty({ description: 'Код' })
  @IsNumber()
  @IsOptional()
  code: number;
}

export class FindCodeDto {
  @ApiProperty({ description: 'Код' })
  @IsNumber()
  code: number;
}

export class FindTvCodeDto extends FindCodeDto {
  @ApiProperty({ description: 'ID магазина' })
  @IsNumber()
  idStore: number;
}

export class CreateCodeResponseDto {
  @ApiProperty({ description: 'Сообщение' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Код' })
  @IsNumber()
  code: number;
}

export class FindCodeResponseDto {
  @ApiProperty({ description: 'Сообщение' })
  @IsString()
  message: string;

  @ApiProperty({
    example: 42002,
    description: 'Идентификатор магазина',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  idStore?: number;
  @ApiProperty({ description: 'Ответ' })
  @IsBoolean()
  success: boolean;
}

export class PgFieldDto {
  @ApiProperty({ example: 'idStore' })
  name: string;

  @ApiProperty({ example: 1174087 })
  tableID: number;

  @ApiProperty({ example: 2 })
  columnID: number;

  @ApiProperty({ example: 23 })
  dataTypeID: number;

  @ApiProperty({ example: 4 })
  dataTypeSize: number;

  @ApiProperty({ example: -1 })
  dataTypeModifier: number;

  @ApiProperty({ example: 'text' })
  format: string;
}

class RowDto {
  @ApiProperty({ example: 42002 })
  idStore: number;
}

export class QueryResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 1 })
  rowCount: number;

  @ApiProperty({ type: [PgFieldDto] })
  fields: PgFieldDto[];

  @ApiProperty({ example: 'SELECT' })
  command: string;
}

export class QueryIdStoreResultDto extends QueryResultDto {
  @ApiProperty({ type: [RowDto] })
  rows: RowDto[];
}
