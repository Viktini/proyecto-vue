// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tu-clave-secreta-super-segura',
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