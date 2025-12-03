import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret_key_here',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // IMPORTANTE: Usa los nombres correctos de tu entidad User
    return {
      id: user.id,
      gmail: user.gmail,        // Cambiado de email a gmail
      username: user.username,  // Añadido username
      fullName: user.fullName,  // Añadido fullName
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}