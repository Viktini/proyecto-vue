import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { PaqueteTratamiento } from './paquete-tratamiento.entity';

@Entity()
export class Paquete {
  @PrimaryColumn({ name: 'cod_paquete' })
  cod_paquete: string;

  @Column({ name: 'nom_paquete' })
  nom_paquete: string;

  @Column({ name: 'precio_paq' })
  precio_paq: number;

  @Column({ name: 'duracion_total_paq' })
  duracion_total_paq: number;

   @OneToMany(() => PaqueteTratamiento, (tp) => tp.paquete, {
    cascade: true, // ← ¡ESTO ES IMPORTANTE!
  })
  tratamientos: PaqueteTratamiento[];
}