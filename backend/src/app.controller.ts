// backend/src/app.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ✅ ENDPOINT DE PRUEBA PARA VERIFICAR CONEXIÓN
  @Get('health')
  getHealth() {
    return {
      status: '✅ BACKEND FUNCIONANDO',
      timestamp: new Date().toISOString(),
      message: 'El backend está conectado correctamente',
      environment: process.env.NODE_ENV || 'development',
      database: 'PostgreSQL',
      framework: 'NestJS'
    };
  }

  @Post('test-connection')
  testConnection(@Body() data: any) {
    return {
      status: '✅ MENSAJE RECIBIDO EN EL BACKEND',
      dataReceived: data,
      backendResponse: 'El frontend Vue.js se está comunicando correctamente con el backend NestJS',
      timestamp: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
  }
}