import { IsString, IsNumber, IsNotEmpty, Min, Max, IsAlphanumeric } from 'class-validator';

export class CreatePaqueteDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  cod_paquete: string;

  @IsString()
  @IsNotEmpty()
  nom_paquete: string;

  @IsNumber()
  @Min(0)
  precio_paq: number;

  @IsNumber()
  @Min(5)
  @Max(480)
  duracion_total_paq: number;

}