import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crea la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // Configuración global
  app.enableCors();  // Permite peticiones del frontend
  app.setGlobalPrefix('api');  // Todas las rutas empiezan con /api

  // Inicia el servidor
  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}
bootstrap();