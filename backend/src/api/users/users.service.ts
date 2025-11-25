// users.service.ts - CORREGIDO
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { pool } from '../../config/database';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll() {
    try {
      this.logger.log('Obteniendo usuarios desde la base de datos...');
      
      const result = await pool.query(`
        SELECT id, name, last_name as "lastName", email, created_at as "createdAt"
        FROM usuarios  -- ⚠️ VERIFICAR: ¿La tabla se llama 'usuario' o 'usuarios'?
        ORDER BY created_at DESC
      `);
      
      this.logger.log(`Se encontraron ${result.rows.length} usuarios`);
      return result.rows;
    } catch (error) {
      this.logger.error('Error en findAll:', error);
      throw new HttpException(
        `Error obteniendo usuarios: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { name, lastName, email } = createUserDto;
    
    try {
      this.logger.log(`Creando usuario: ${email}`);
      
      // Verificar si el usuario ya existe
      const existingUser = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1', // ⚠️ VERIFICAR nombre de tabla
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        throw new HttpException(
          'El email ya existe en la base de datos',
          HttpStatus.CONFLICT
        );
      }
      
      const result = await pool.query(
        `INSERT INTO usuarios (name, last_name, email, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, name, last_name as "lastName", email, created_at as "createdAt"`,
        [name, lastName, email]
      );
      
      this.logger.log(`Usuario creado con ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error en create:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Error creando usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}