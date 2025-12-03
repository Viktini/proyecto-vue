// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  gmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El usuario solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;
}