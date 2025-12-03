// src/main.ts - VERSIÓN CORREGIDA
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad
  app.use(helmet());
  app.use(compression());

  // CORS - ¡CONFIGURACIÓN CRÍTICA!
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Tu frontend Vue.js
      'http://localhost:8080',  // Otra posible URL del frontend
      'http://localhost:5173',  // Vite dev server
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: ['Authorization'],
    credentials: true, // Importante para cookies/tokens
    maxAge: 86400, // 24 horas
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  // Prefijo API
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Backend running on: ${await app.getUrl()}`);
  console.log(`🌐 CORS configurado para: http://localhost:3000`);
}
bootstrap();