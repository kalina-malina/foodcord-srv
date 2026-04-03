import { transformNumber } from '@/utils/transform-array';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

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

/**
 * Один token — один code для всех ТВ (хранится в Redis).
 * Первый ТВ может передать code (опционально), иначе сервер выберет 4-значный.
 * Планшет один раз вводит этот code и вызывает find-one-tv-pad.
 */
export class InitTvPairingByTokenDto {
  @ApiProperty({
    description:
      'Общий идентификатор группы ТВ (одинаковый на всех экранах одного зала)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  token: string;

  @ApiProperty({
    description:
      'Необязательно: желаемый код; если сессия уже есть — возвращается закреплённый код',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  @Min(1000)
  @Max(999999)
  code?: number;
}

/** Клиент задаёт код на ТВ; несколько ТВ с одним code вызывают тот же endpoint — в БД одна строка. */
export class RegisterTvCodeDto {
  @ApiProperty({ description: 'Код сопряжения (показывается на ТВ, вводится на планшете)' })
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  @Min(1000)
  @Max(999999)
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

  @ApiProperty({ description: 'Название магазина' })
  @IsString()
  nameStore?: string;
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

  @ApiProperty({ example: 'Молодежный 2' })
  nameStore: string;
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
