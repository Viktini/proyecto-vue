// usuarios.controller.ts - VERSIÓN CORREGIDA
import { Controller, Get, Post, Body, UsePipes } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('test')
  test() {
    return { 
      message: '✅ Servidor de usuarios funcionando',
      timestamp: new Date().toISOString()
    };
  }

  // ✅ USAR DTO CON VALIDACIÓN
  @Post('register')
  @UsePipes(new ValidationPipe()) // Validación explícita
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    console.log('📝 Registrando usuario con DTO:', createUsuarioDto);
    return await this.usuariosService.create(createUsuarioDto);
  }
  
  @Post('login')
  async login(@Body() body: { nom_usuario: string; contrasenna_usuario: string }) {
    console.log('🔐 Login para:', body.nom_usuario);
    const usuario = await this.usuariosService.login(
      body.nom_usuario, 
      body.contrasenna_usuario
    );
    
    return {
      message: 'Login exitoso',
      usuario: {
        nom_usuario: usuario.nom_usuario,
        rol_usuario: usuario.rol_usuario
      }
    };
  }
  
}