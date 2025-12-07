// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extraer token de cookie o header Authorization
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // 1. Intentar obtener de cookie
          if (request?.cookies?.access_token) {
            return request.cookies.access_token;
          }
          
          // 2. Intentar obtener de header Authorization (para compatibilidad)
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }
          
          // 3. Intentar obtener de query string (opcional, para desarrollo)
          if (request?.query?.token) {
            return request.query.token as string;
          }
          
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Este payload es lo que enviaste cuando creaste el token
    return {
      id_usuario: payload.sub,
      nom_usuario: payload.username,
      rol_usuario: payload.role,
    };
  }
}