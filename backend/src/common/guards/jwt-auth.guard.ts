// src/common/guards/jwt-auth.guard.ts - CON REFLECTOR
import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  import { Observable } from 'rxjs';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
      super();
    }
  
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      // Verificar si el endpoint es público
      const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
      
      if (isPublic) {
        return true;
      }
      
      return super.canActivate(context);
    }
  
    handleRequest(err: any, user: any, info: any) {
      if (err || !user) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      return user;
    }
  }