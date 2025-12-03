// src/areas/entities/area.entity.ts - CORREGIDO
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('area') // Nombre de la tabla en la BD
export class Area {
  @PrimaryColumn({ name: 'nom_area' }) // Columna real en la BD
  nombre_area: string;

  @Column({ name: 'cant_personal_fijo', type: 'int' }) // Columna real en la BD
  cantidad_personal_fijo: number;
}