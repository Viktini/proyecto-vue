// app.module.ts - CORREGIDO
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { AreasModule } from './areas/areas.module';
import { PaquetesModule } from './paquetes/paquetes.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    // 🔧 ConfigModule global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 🔐 AuthModule 
    AuthModule,
    
    // 📦 Otros módulos
    TratamientosModule,
    AreasModule,
    PaquetesModule,
    UsuariosModule,
    
    // 🗄️ TypeORM - IMPORTANTE: NO usar ConfigService en imports
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ← SOLO ConfigModule aquí
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASS', 'Inukibunti.0'),
        database: configService.get('DB_NAME', 'SPA'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'true') === 'true',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService], // ← ConfigService se inyecta aquí, NO en imports
    }),
    
    // 🔑 JWT Module global
    JwtModule.registerAsync({
      imports: [ConfigModule], // ← SOLO ConfigModule aquí
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'clave-secreta-temporal-para-desarrollo'),
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h') 
        },
      }),
      inject: [ConfigService], // ← ConfigService se inyecta aquí
      global: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}