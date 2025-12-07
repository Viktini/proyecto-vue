// main.ts - VERSIÓN MEJORADA CON COOKIE-PARSER
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { testConnection } from './config/database';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Probar conexión a la base de datos antes de iniciar
    logger.log('🔍 Probando conexión a la base de datos...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('❌ No se pudo conectar a la base de datos. Verifica:');
      logger.error('   - PostgreSQL está ejecutándose');
      logger.error('   - Las credenciales en .env son correctas');
      logger.error('   - La base de datos "SPA" existe');
      process.exit(1);
    }

    logger.log('✅ Conexión a la base de datos establecida');

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    // Middleware para parsear cookies (¡IMPORTANTE!)
    app.use(cookieParser());

    // Configuración CORS más robusta para cookies
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174', // Para Vite alternativo
    ];

    app.enableCors({
      origin: (origin, callback) => {
        // Permitir requests sin origen (como mobile apps o curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
          callback(null, true);
        } else {
          logger.warn(`⚠️  Origen CORS bloqueado: ${origin}`);
          callback(new Error('Origen no permitido por CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // ¡IMPORTANTE! Permite enviar cookies
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-API-KEY',
        'Set-Cookie',
        'Cookie',
      ],
      exposedHeaders: [
        'Set-Cookie',
        'Authorization',
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 600, // Cache preflight requests por 10 minutos
    });

    // Configuración global de validación
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Elimina propiedades no decoradas
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los datos a los tipos especificados
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
      validationError: {
        target: false, // No incluir el objeto target en el error
        value: false, // No incluir el valor en el error
      }
    }));

    // Prefijo global para API
    app.setGlobalPrefix('api', {
      exclude: ['health', ''] // Excluir rutas específicas
    });

    const port = process.env.PORT || 5000;

    await app.listen(port);

    logger.log(`🚀 Backend NestJS ejecutándose en: http://localhost:${port}`);
    logger.log(`🌍 Health check: http://localhost:${port}/health`);
    logger.log(`👤 Users API: http://localhost:${port}/api/usuarios`);
    logger.log(`💆 Tratamientos API: http://localhost:${port}/api/tratamientos`);
    logger.log(`📊 Áreas API: http://localhost:${port}/api/areas`);
    logger.log(`🍪 Cookie-parser configurado correctamente`);
    logger.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`📝 Cookies HTTP-only habilitadas`);
    logger.log(`✅ CORS configurado para desarrollo con cookies`);

    // Mostrar configuración de cookies según entorno
    if (process.env.NODE_ENV === 'production') {
      logger.log(`⚡ MODO PRODUCCIÓN: Cookies con secure:true y sameSite:lax`);
    } else {
      logger.log(`🔬 MODO DESARROLLO: Cookies con secure:false y sameSite:lax`);
    }

  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();