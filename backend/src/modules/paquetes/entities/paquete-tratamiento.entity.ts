import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Paquete } from './paquete.entity';
import { Tratamiento } from '../../tratamientos/entities/tratamiento.entity';

@Entity('tp')
export class PaqueteTratamiento {
  // AMBAS son @PrimaryColumn - PK compuesta
  @PrimaryColumn({ name: 'cod_paquete' })
  paqueteId: string;

  @PrimaryColumn({ name: 'cod_trat' })
  tratamientoId: string;

  @ManyToOne(() => Paquete, (paquete) => paquete.tratamientos, { 
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cod_paquete' })
  paquete: Paquete;

  @ManyToOne(() => Tratamiento, (tratamiento) => tratamiento.paquetes, { 
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cod_trat' })
  tratamiento: Tratamiento;
}