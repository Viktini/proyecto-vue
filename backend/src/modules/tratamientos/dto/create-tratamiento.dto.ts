import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateTratamientoDto {
  
  @IsString()
  @IsNotEmpty()
  cod_trat: string
  
  @IsString()
  @IsNotEmpty()
  nom_trat: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @Min(5)
  @Max(480)
  duracion: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  frecuencia_mensual?: number;

  @IsOptional()
  @IsString()
  materiales_necesarios?: string;
}