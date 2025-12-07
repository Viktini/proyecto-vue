// app.module.ts - VERSIÓN FINAL
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TratamientosModule } from './modules/tratamientos/tratamientos.module';
import { AreasModule } from './modules/areas/areas.module';
import { PaquetesModule } from './modules/paquetes/paquetes.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { UsuariosModule } from './modules/users/usuarios.module';

@Module({
  imports: [
    // 🔧 ConfigModule global (ESTO ES NECESARIO PARA QUE AuthModule FUNCIONE)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🔐 AuthModule (ahora exporta JwtModule)
    AuthModule,

    // 📦 Otros módulos
    TratamientosModule,
    AreasModule,
    PaquetesModule,
    UsuariosModule,

    // 🗄️ TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
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
      inject: [ConfigService],
    }),

    // ❌ NO MÁS JwtModule.registerAsync global aquí
    // Ya está configurado en AuthModule
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
export class AppModule { }