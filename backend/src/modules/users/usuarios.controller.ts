// 1. Eliminar login/register de UsuariosController

import { Controller, Get } from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";

// usuarios.controller.ts - MODIFICAR:
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

}