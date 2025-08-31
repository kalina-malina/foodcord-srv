import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class LoginDtoAuthJWT {
  @IsEmail()
  @ApiProperty({ example: 'lebedevvv@volcov.ru' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'djF&2Lip' })
  password: string;
}

export class RefreshTokenDTO {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cC',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refresh: string;
}

export class updateTokenDTO {
  @IsString()
  @ApiProperty({ example: 'azsdfgaerg21342r3' })
  refreshToken: string;
}

export class UserDTO {
  @IsBoolean()
  role: boolean;
  @IsNumber()
  userId: number;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cC',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refresh: string;
}
