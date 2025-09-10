import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Delete,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LoginDtoAuthJWT } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { User } from './decorator/user.decorator';
import { getUserDto } from '@/users/dto/create-user.dto';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dataLogin: LoginDtoAuthJWT,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.login(dataLogin, req, res);
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout(req, res);
    return res.status(200).json({ auth: true, message: 'Прощайте' });
  }

  @Get('test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async test(@User() user: getUserDto) {
    return user;
  }
}
