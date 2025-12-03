// tratamiento.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tratamiento') 
export class Tratamiento {
  @PrimaryColumn({ name: 'cod_trat', type: 'varchar', length: 10 })
  codigo_tratamiento: string;

  @Column({ name: 'nom_trat', type: 'varchar', length: 255, nullable: false })
  nombre_tratamiento: string;

  @Column({ name: 'categoria', type: 'varchar', length: 100, nullable: false })
  categoria: string;

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @Column({ name: 'duracion', type: 'int' })
  duracion: number;

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'frecuencia_mensual', type: 'int', nullable: true })
  frecuencia_mensual: number;

  @Column({ name: 'materiales_necesarios', type: 'text', nullable: true })
  materiales_necesarios: string;
}