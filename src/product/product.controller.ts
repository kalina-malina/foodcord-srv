import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  @Get()
  @ApiCookieAuth('access_token')
  @ApiCookieAuth('refresh_token')
  async findAll() {
    return { prduct: 1 };
  }
}
