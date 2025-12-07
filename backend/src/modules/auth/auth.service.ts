// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../users/entities/usuario.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) { }

  // auth.service.ts - método validateUser
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usuariosRepository.findOne({
      where: { nom_usuario: username },
      select: ['id_usuario', 'nom_usuario', 'contrasenna_usuario', 'rol_usuario'] // ✅ Seleccionar campos
    });

    console.log('🔍 validateUser - usuario encontrado en DB:', user);

    if (user && await bcrypt.compare(password, user.contrasenna_usuario)) {
      const { contrasenna_usuario, ...result } = user;
      console.log('🔍 validateUser - usuario a retornar:', result);
      return result;
    }

    return null;
  }

  // auth.service.ts - método login
  async login(user: any) {
    const payload = {
      username: user.nom_usuario,
      sub: user.id_usuario,
      role: user.rol_usuario,
    };

    console.log('🔍 AuthService - usuario recibido:', user);
    console.log('🔍 Propiedades del usuario:', {
      id_usuario: user.id_usuario,
      nom_usuario: user.nom_usuario,
      rol_usuario: user.rol_usuario
    });

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: user.id_usuario, // ✅ Asegurar que existan
        nom_usuario: user.nom_usuario,
        rol_usuario: user.rol_usuario,
      },
    };
  }

  // src/auth/auth.service.ts
  async register(userData: {
    id_usuario: string; // Carnet como ID
    nom_usuario: string;
    contrasenna_usuario: string;
    rol_usuario?: string;
  }) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usuariosRepository.findOne({
      where: [
        { nom_usuario: userData.nom_usuario },
        { id_usuario: userData.id_usuario }
      ],
    });

    if (existingUser) {
      if (existingUser.id_usuario === userData.id_usuario) {
        throw new UnauthorizedException('El carnet ya está registrado');
      }
      if (existingUser.nom_usuario === userData.nom_usuario) {
        throw new UnauthorizedException('El nombre de usuario ya existe');
      }
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.contrasenna_usuario, 10);

    // Crear nuevo usuario
    const newUser = this.usuariosRepository.create({
      id_usuario: userData.id_usuario,
      nom_usuario: userData.nom_usuario,
      contrasenna_usuario: hashedPassword,
      rol_usuario: userData.rol_usuario || 'cliente',
    });

    await this.usuariosRepository.save(newUser);

    // Generar token automáticamente
    return this.login(newUser);
  }
}