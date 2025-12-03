// usuarios.service.ts - VERSIÓN MEJORADA
import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) { }

  // usuarios.service.ts - VERSIÓN ACTUALIZADA
  async create(createUsuarioDto: CreateUsuarioDto): Promise<any> {
    const { id_usuario, nom_usuario, contrasenna_usuario, rol_usuario = 'cliente' } = createUsuarioDto;

    console.log('🔧 Registrando usuario:', { id_usuario, nom_usuario, rol_usuario });

    try {
      // 1. Verificar si el carnet ya existe
      const existeCarnet = await this.usuarioRepository.findOne({
        where: { id_usuario }
      });

      if (existeCarnet) {
        throw new ConflictException('El carnet de identidad ya está registrado');
      }

      // 2. Verificar si el nombre de usuario ya existe
      const existeUsuario = await this.usuarioRepository.findOne({
        where: { nom_usuario }
      });

      if (existeUsuario) {
        throw new ConflictException('El nombre de usuario ya existe');
      }

      // 3. Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contrasenna_usuario, 10);

      // 4. Insertar usuario
      const usuario = this.usuarioRepository.create({
        id_usuario,
        nom_usuario,
        contrasenna_usuario: hashedPassword,
        rol_usuario
      });

      const resultado = await this.usuarioRepository.save(usuario);
      console.log('✅ Usuario registrado exitosamente:', resultado);

      return {
        message: 'Usuario registrado exitosamente',
        usuario: {
          id_usuario: resultado.id_usuario,
          nom_usuario: resultado.nom_usuario,
          rol_usuario: resultado.rol_usuario
        }
      };

    } catch (error) {
      console.error('❌ Error en registro:', error);

      if (error.code === '23505') {
        throw new ConflictException('El carnet o usuario ya existe');
      }

      throw new ConflictException('Error del servidor: ' + error.message);
    }
  }

  async login(nom_usuario: string, contrasenna_usuario: string): Promise<Usuario> {
    console.log('🔐 Verificando login para:', nom_usuario);

    try {
      // Buscar usuario
      const usuario = await this.usuarioRepository.findOne({
        where: { nom_usuario }
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar contraseña
      const contrasennaValida = await bcrypt.compare(
        contrasenna_usuario,
        usuario.contrasenna_usuario
      );

      if (!contrasennaValida) {
        throw new ConflictException('Contraseña incorrecta');
      }

      console.log('✅ Login exitoso');
      return usuario;

    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }
}