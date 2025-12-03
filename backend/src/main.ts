// main.ts - VERSIÓN MEJORADA
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { testConnection } from './config/database';

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
      logger: ['error', 'warn', 'log', 'debug'], // Niveles de log
      cors: true // Habilitar CORS globalmente
    });

    // Configuración CORS más robusta
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-API-KEY'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204
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

    app.setGlobalPrefix('api', {
      exclude: ['health', ''] // Excluir rutas específicas
    });
    const port = process.env.PORT || 5000;

    await app.listen(port);

    logger.log(`🚀 Backend NestJS ejecutándose en: http://localhost:${port}`);
    logger.log(`🌍 Health check: http://localhost:${port}/health`);
    logger.log(`👤 Users API: http://localhost:${port}/api/users`);
    logger.log(`💆 Tratamientos API: http://localhost:${port}/api/tratamientos`);
    logger.log(`📊 Áreas API: http://localhost:${port}/api/areas`);
    logger.log(`✅ CORS configurado para Vue.js`);
    logger.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);

  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();