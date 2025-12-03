// create-usuario.dto.ts - VERSIÓN ACTUALIZADA
import { IsString, IsNotEmpty, MinLength, IsNumber } from 'class-validator';

export class CreateUsuarioDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El carnet de identidad es requerido' })
  id_usuario: number; // ✅ Carnet como ID

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  nom_usuario: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasenna_usuario: string;

  @IsString()
  rol_usuario?: string; // 'admin' o 'cliente'
}