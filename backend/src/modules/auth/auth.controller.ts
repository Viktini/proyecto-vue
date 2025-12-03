// src/modules/auth/auth.controller.ts - VERSIÓN CORREGIDA
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Get,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========== ENDPOINTS PÚBLICOS ==========

  @Public() // ¡ESTO ES CRÍTICO!
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      };
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('ya está registrado')) {
        throw new BadRequestException({
          success: false,
          message: 'El gmail o nombre de usuario ya está registrado',
          error: 'CONFLICT',
        });
      }
      if (error.message?.includes('contraseñas') || error.message?.includes('coinciden')) {
        throw new BadRequestException({
          success: false,
          message: 'Las contraseñas no coinciden',
          error: 'BAD_REQUEST',
        });
      }
      throw new BadRequestException({
        success: false,
        message: error.message || 'Error en el registro',
        error: 'BAD_REQUEST',
      });
    }
  }

  @Public() // ¡ESTO ES CRÍTICO!
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.usernameOrEmail,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Usuario o contraseña incorrectos',
        error: 'INVALID_CREDENTIALS',
      });
    }

    const tokens = await this.authService.login(user);

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: tokens,
    };
  }

  @Public() // ¡ESTO ES CRÍTICO!
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const tokens = await this.authService.refreshToken(
        refreshTokenDto.refreshToken,
      );

      return {
        success: true,
        message: 'Tokens actualizados exitosamente',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        message: 'Token de refresco inválido o expirado',
        error: 'INVALID_REFRESH_TOKEN',
      });
    }
  }

  @Public() // ¡ESTO ES CRÍTICO!
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      success: true,
      message: 'Servicio de autenticación funcionando',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'auth',
      },
    };
  }

  // ========== ENDPOINTS PROTEGIDOS ==========

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req) {
    await this.authService.logout(req.user.id);

    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
      data: null,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req) {
    const userProfile = {
      id: req.user.id,
      fullName: req.user.fullName,
      gmail: req.user.gmail,
      username: req.user.username,
      role: req.user.role,
      createdAt: req.user.createdAt,
    };

    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: userProfile,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.authService.changePassword(
        req.user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: null,
      };
    } catch (error) {
      if (error.message?.includes('incorrect')) {
        throw new UnauthorizedException({
          success: false,
          message: 'La contraseña actual es incorrecta',
          error: 'INVALID_PASSWORD',
        });
      }
      throw error;
    }
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Req() req) {
    return {
      success: true,
      message: 'Token válido',
      data: {
        valid: true,
        user: {
          id: req.user.id,
          fullName: req.user.fullName,
          gmail: req.user.gmail,
          username: req.user.username,
          role: req.user.role,
        },
      },
    };
  }
}