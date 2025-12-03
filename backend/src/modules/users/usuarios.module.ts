// usuarios/usuarios.module.ts - VERIFICA ESTE ARCHIVO
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController], // ✅ Asegúrate que el controlador esté aquí
  providers: [UsuariosService],
  exports: [UsuariosService]
})
export class UsuariosModule {}