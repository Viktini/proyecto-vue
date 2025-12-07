import { IsAlphanumeric } from 'class-validator';

export class CreatePaqueteTratamientoDto {
  @IsAlphanumeric()
  tratamiento_id: string;
}