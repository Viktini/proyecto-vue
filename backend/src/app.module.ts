// app.module.ts - CORREGIDO
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { AreasModule } from './areas/areas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
        synchronize: false, // ⚠️ CAMBIAR A false - IMPORTANTE
        logging: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    TratamientosModule,
    AreasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}