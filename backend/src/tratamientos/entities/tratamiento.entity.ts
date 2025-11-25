// src/tratamientos/entities/tratamiento.entity.ts - CORREGIDO
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tratamiento') 
export class Tratamiento {
  @PrimaryColumn({ name: 'cod_trat' })
  codigo_tratamiento: string;

  @Column({ name: 'nom_trat' })
  nombre_tratamiento: string;

  @Column({ name: 'categoria' }) // Si es un campo de texto directo
  categoria: string;

  @Column('text')
  descripcion: string;

  @Column('int')
  duracion: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'frecuencia_mensual', type: 'int', nullable: true })
  frecuencia_mensual: number;

  @Column({ name: 'materiales_necesarios', type: 'text', nullable: true })
  materiales_necesarios: string;
}