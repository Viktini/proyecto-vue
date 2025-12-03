// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { username: string; password: string }) {
    // El LocalAuthGuard ya validó el usuario
    // @Body() es para compatibilidad con tu frontend
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: {
      username: string;
      password: string;
      role?: string;
    },
  ) {
    return this.authService.register({
      nom_usuario: registerDto.username,
      contrasenna_usuario: registerDto.password,
      rol_usuario: registerDto.role,
    });
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken() {
    // Este endpoint es verificado por JwtAuthGuard automáticamente
    return { message: 'Token válido' };
  }
}