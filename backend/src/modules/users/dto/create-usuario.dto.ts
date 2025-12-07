// create-usuario.dto.ts - VERSIÓN ACTUALIZADA
import { IsString, IsNotEmpty, MinLength, IsNumber, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El carnet de identidad es requerido' })
  @MinLength(11, { message: 'El carnet de identidad debe tener 11 caracteres'})
  @MaxLength(11, { message: 'El carnet de identidad debe teenr 11 caracteres'})
  id_usuario: string;

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