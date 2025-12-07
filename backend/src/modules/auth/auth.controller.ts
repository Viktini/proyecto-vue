// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Res, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { Response, Request } from 'express'; // ¡IMPORTANTE! Importar desde express

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Get('debug-cookies')
  debugCookies(@Req() req: Request) {
    return {
      cookies: req.cookies,
      headers: req.headers,
    };
  }

  // auth.controller.ts - método login CORREGIDO
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: any, // ← AÑADIR esto para obtener el usuario validado
    @Res({ passthrough: true }) res: Response
  ) {
    console.log('🔍 AuthController - req.user:', req.user); // ← VERIFICAR

    // ✅ Usar req.user (usuario validado por LocalAuthGuard) en lugar de loginDto
    const result = await this.authService.login(req.user);

    // Guardar token en cookie HTTP-only
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    console.log('🔍 Login - usuario a devolver:', result.usuario);

    return {
      message: 'Login successful',
      usuario: result.usuario
    };
  }
  
  // src/auth/auth.controller.ts - método register
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: {
      id_usuario: string; // Carnet
      nom_usuario: string;
      contrasenna_usuario: string;
      rol_usuario?: string;
    },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(registerDto);

    // Guardar token en cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Registro exitoso',
      usuario: result.usuario
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Eliminar la cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logout successful' };
  }

  @Get('me')
  async getProfile(@Req() req: Request & { user: any }) {
    return {
      user: req.user,
      message: 'Perfil del usuario'
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken() {
    // Este endpoint es verificado por JwtAuthGuard automáticamente
    return { message: 'Token válido', valid: true };
  }
}