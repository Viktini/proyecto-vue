// src/common/guards/jwt-auth.guard.ts - CON SOPORTE PARA @Public()
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si es público, permitir acceso sin token
    if (isPublic) {
      return true;
    }

    // De lo contrario, aplicar el guard JWT normal
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      let message = 'Token inválido o expirado';
      
      if (info?.name === 'TokenExpiredError') {
        message = 'El token ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (info?.name === 'JsonWebTokenError') {
        message = 'Formato de token inválido';
      }
      
      throw new UnauthorizedException({
        success: false,
        message,
        error: 'UNAUTHORIZED',
      });
    }
    return user;
  }
}