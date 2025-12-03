// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usuariosRepository.findOne({
      where: { nom_usuario: username },
    });

    if (user && await bcrypt.compare(password, user.contrasenna_usuario)) {
      const { contrasenna_usuario, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.nom_usuario,
      sub: user.id_usuario,
      role: user.rol_usuario,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: user.id_usuario,
        nom_usuario: user.nom_usuario,
        rol_usuario: user.rol_usuario,
      },
    };
  }

  async register(userData: {
    nom_usuario: string;
    contrasenna_usuario: string;
    rol_usuario?: string;
  }) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usuariosRepository.findOne({
      where: { nom_usuario: userData.nom_usuario },
    });

    if (existingUser) {
      throw new UnauthorizedException('El usuario ya existe');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.contrasenna_usuario, 10);

    // Crear nuevo usuario
    const newUser = this.usuariosRepository.create({
      nom_usuario: userData.nom_usuario,
      contrasenna_usuario: hashedPassword,
      rol_usuario: userData.rol_usuario || 'cliente',
    });

    await this.usuariosRepository.save(newUser);

    // Generar token automáticamente
    return this.login(newUser);
  }
}