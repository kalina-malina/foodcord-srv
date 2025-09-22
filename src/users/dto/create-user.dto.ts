import { USER_ROLE } from '@/role/enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';

export class createUserDTO {
  @IsEmail()
  @ApiProperty({ example: 'lebedevvv@volcov.ru' })
  email: string;

  @IsNumber()
  @ApiProperty({ example: 42002 })
  id_store: number;

  @IsString()
  @ApiProperty({ example: '' })
  last_name: string;

  @IsString()
  @ApiProperty({ example: '' })
  first_name: string;

  @IsString()
  @ApiProperty({ example: '' })
  middle_name: string;

  @ApiProperty({
    enum: USER_ROLE,
    enumName: 'UserRole',
    example: USER_ROLE.ADMIN,
    description: 'ID роли пользователя',
  })
  @IsEnum(USER_ROLE)
  role: USER_ROLE;
}

export class getUserDto {
  selectedRole: boolean;
  url: string;
  user: {
    idUser: number;
    idRole: number;
    idStore: number[];
    testServer: boolean;
    isAdmin: boolean;
    isAdminProduct: boolean;
    isGrillProject: boolean;
    userName: string;
    email: string;
  };
}
