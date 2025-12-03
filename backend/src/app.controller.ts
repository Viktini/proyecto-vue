// backend/src/app.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator'; // Añade esta importación

@Controller() // Sin ruta específica
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('test')
  @Public()
  test() {
    return {
      message: 'Backend funciona!',
      timestamp: new Date().toISOString()
    };
  }

  @Get() // Responde a GET / y GET /api/v1/ si tienes prefijo
  @Public()
  getRoot() {
    return {
      message: '✅ Backend Belleza y Relajación - NestJS',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        root: 'GET / (esta ruta)',
        health: 'GET /health',
        login: 'POST /auth/login',
        register: 'POST /auth/register'
      }
    };
  }

  @Get('health')
  @Public()
  getHealth() {
    return {
      status: '✅ BACKEND FUNCIONANDO',
      timestamp: new Date().toISOString(),
      message: 'Backend conectado correctamente'
    };
  }

  // app.controller.ts
  @Get('modules-status')
  @Public() // ← Añade esto para hacerlo público
  getModulesStatus() {
    return {
      status: 'Backend funcionando',
      modules: {
        usuarios: 'Cargado ✓',
        tratamientos: 'Cargado ✓',
        areas: 'Cargado ✓',
        paquetes: 'Cargado ✓'
      },
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /health',
        'GET /modules-status',
        'POST /api/usuarios/register',
        'POST /api/usuarios/login',
        'GET /api/usuarios/test'
      ]
    };
  }

  @Post('test-connection')
  @Public() // ← Añade esto para hacerlo público
  testConnection(@Body() data: any) {
    return {
      status: '✅ MENSAJE RECIBIDO EN EL BACKEND',
      dataReceived: data,
      backendResponse: 'El frontend Vue.js se está comunicando correctamente con el backend NestJS',
      timestamp: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}