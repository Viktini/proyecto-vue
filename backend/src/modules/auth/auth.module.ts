// src/modules/auth/auth.module.ts - CON FUNCIÓN SEPARADA
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';

// Función factory explícita
const jwtFactory = {
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.get('JWT_SECRET') || 'default_secret_key_here',
      signOptions: { 
        expiresIn: configService.get('JWT_EXPIRES_IN') || '1h' 
      },
    };
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync(jwtFactory),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [
    AuthService, 
    JwtModule, 
    PassportModule
  ],
})
export class AuthModule {}