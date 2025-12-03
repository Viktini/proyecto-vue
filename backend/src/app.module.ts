// src/app.module.ts - VERSIÓN CORREGIDA
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // 1. Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Base de datos PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'belleza_relajacion',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // true en desarrollo
      logging: process.env.NODE_ENV === 'development',
    }),

    // 3. Módulos de la aplicación
    AuthModule,
    UsersModule,
  ],
  providers: [
    // IMPORTANTE: Solo un guard global JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard de roles (opcional, si lo usas)
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}