// main.ts - MEJORADO
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { testConnection } from './config/database';

async function bootstrap() {
  // Probar conexión a la base de datos antes de iniciar
  console.log('🔍 Probando conexión a la base de datos...');
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la base de datos. Verifica:');
    console.error('   - PostgreSQL está ejecutándose');
    console.error('   - Las credenciales en .env son correctas');
    console.error('   - La base de datos "SPA" existe');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8080', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://localhost:5173'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept'
  });
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true 
  }));
  
  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`🚀 Backend NestJS ejecutándose en: http://localhost:${port}`);
  console.log(`🌍 Health check: http://localhost:${port}/health`);
  console.log(`👤 Users API: http://localhost:${port}/users`);
  console.log(`💆 Tratamientos API: http://localhost:${port}/tratamientos`);
  console.log(`✅ CORS configurado para Vue.js`);
}
bootstrap();