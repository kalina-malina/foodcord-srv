import { transformNumber } from '@/utils/transform-array';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCodeDto {
  @ApiProperty({ description: 'ID магазина' })
  @Transform(({ value }) => {
    return transformNumber(value);
  })
  @IsNumber()
  @IsOptional()
  idStore?: number;
}

export class CreateCodeTvDto {
  @ApiProperty({ description: 'Код' })
  @Transform(({ value }) => {
    return transformNumber(value);
  })
  @IsNumber()
  @IsOptional()
  code: number;
}

export class FindCodeDto {
  @ApiProperty({ description: 'Код' })
  @Transform(({ value }) => {
    return transformNumber(value);
  })
  @IsNumber()
  code: number;
}

export class FindTvCodeDto extends FindCodeDto {
  @ApiProperty({ description: 'ID магазина' })
  @Transform(({ value }) => {
    return transformNumber(value);
  })
  @IsNumber()
  idStore: number;
}

export class CreateCodeResponseDto {
  @ApiProperty({ description: 'Сообщение' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Код' })
  @Transform(({ value }) => {
    return transformNumber(value);
  })
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
  @Transform(({ value }) => {
    return transformNumber(value);
  })
  @IsNumber()
  idStore?: number;
  @ApiProperty({ description: 'Ответ' })
  @Transform(({ value }) => {
    return value === 'true';
  })
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
