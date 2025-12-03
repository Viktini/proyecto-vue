// src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  // ========== REGISTRO ==========

  async register(registerDto: RegisterDto): Promise<any> {
    // Verificar si el gmail ya existe
    const existingUserByEmail = await this.usersService.findByEmail(registerDto.gmail);
    if (existingUserByEmail) {
      throw new ConflictException('El gmail ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUserByUsername = await this.usersService.findByUsername(registerDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    // Verificar que las contraseñas coincidan
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Crear usuario
    const user = await this.usersService.create({
      fullName: registerDto.fullName,
      gmail: registerDto.gmail,
      username: registerDto.username,
      password: registerDto.password,
      role: 'cliente', // Por defecto, todos son clientes
    });

    // Generar tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`Nuevo usuario registrado: ${user.gmail}`);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          gmail: user.gmail,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        }
      }
    };
  }

  // ========== VALIDACIÓN ==========

  async validateUser(usernameOrEmail: string, password: string): Promise<any> {
    // Buscar por username o email
    let user = await this.usersService.findByUsername(usernameOrEmail);
    
    if (!user) {
      // Si no encuentra por username, buscar por email
      user = await this.usersService.findByEmail(usernameOrEmail);
    }
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      this.logger.warn(`Intento fallido de login para: ${usernameOrEmail}`);
      return null;
    }
    
    // Retornar usuario sin datos sensibles
    const { password: _, refreshToken: __, ...safeUser } = user;
    return safeUser;
  }

  // ========== LOGIN ==========

  async login(user: any): Promise<any> {
    // Obtener usuario completo
    const fullUser = await this.usersService.findById(user.id);
    
    if (!fullUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Generar tokens
    const tokens = await this.generateTokens(fullUser);

    // Actualizar refresh token
    await this.usersService.updateRefreshToken(fullUser.id, tokens.refresh_token);

    this.logger.log(`Usuario logueado: ${fullUser.gmail}`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: this.configService.get('JWT_EXPIRES_IN', '1h'),
      user: {
        id: fullUser.id,
        fullName: fullUser.fullName,  // Cambiado de name a fullName
        gmail: fullUser.gmail,        // Cambiado de email a gmail
        username: fullUser.username,  // Añadido username
        role: fullUser.role,
        createdAt: fullUser.createdAt,
      },
    };
  }

  // ========== REFRESH TOKEN ==========

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      // Verificar token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Buscar usuario
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar que coincida el token
      if (!user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user);

      // Actualizar en BD
      await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

      this.logger.log(`Tokens refrescados para: ${user.gmail}`);  // Cambiado de email a gmail

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: this.configService.get('JWT_EXPIRES_IN', '1h'),
        user: {
          id: user.id,
          fullName: user.fullName,    // Cambiado de name a fullName
          gmail: user.gmail,          // Cambiado de email a gmail
          username: user.username,    // Añadido username
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expirado');
      }
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  // ========== LOGOUT ==========

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, null);
    this.logger.log(`Usuario deslogueado: ${userId}`);
    return { message: 'Sesión cerrada exitosamente' };
  }

  // ========== CAMBIO DE CONTRASEÑA ==========

  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Verificar que sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
    if (isSamePassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente');
    }

    // Actualizar contraseña
    user.password = newPassword;
    await this.usersService.save(user);

    // Invalidar tokens
    await this.usersService.updateRefreshToken(userId, null);

    this.logger.log(`Contraseña cambiada para: ${user.gmail}`);  // Cambiado de email a gmail

    return { message: 'Contraseña cambiada exitosamente' };
  }

  // ========== MÉTODOS PRIVADOS ==========

  private async generateTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const accessPayload = {
      sub: user.id,
      username: user.username,
      gmail: user.gmail,      // Cambiado de email a gmail
      fullName: user.fullName, // Cambiado de name a fullName
      role: user.role,
    };

    const refreshPayload = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      secret: this.configService.get('JWT_SECRET'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // ========== MÉTODOS ÚTILES ==========

  async verifyToken(accessToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        return { valid: false, reason: 'Usuario no encontrado' };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          gmail: user.gmail,      // Cambiado de email a gmail
          username: user.username, // Añadido username
          fullName: user.fullName, // Cambiado de name a fullName
          role: user.role,
        },
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  async getUserById(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }
  
  // NOTA: Los métodos findByUsername, findByEmail y create NO pertenecen aquí
  // Deben estar SOLO en UsersService
}