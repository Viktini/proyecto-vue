import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tratamiento') 
export class Paquete {
  @PrimaryColumn({ name: 'cod_paquete', nullable: false })
  codigo_tratamiento: string;

  @Column({ name: 'nom_paquete', nullable: false })
  nombre_tratamiento: string;

  @Column('decimal', { name: 'precio_paq', precision: 10, scale: 2 , nullable: false})
  precio: number;

  @Column({ name: 'duracion_total_paq', type: 'int', nullable: false })
  frecuencia_mensual: number;
}