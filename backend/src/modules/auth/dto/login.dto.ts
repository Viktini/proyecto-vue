// src/modules/auth/dto/login.dto.ts
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  usernameOrEmail: string; // Acepta username o email

  @IsString()
  @MinLength(6)
  password: string;
}