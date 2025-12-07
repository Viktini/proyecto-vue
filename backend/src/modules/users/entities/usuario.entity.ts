// usuario.entity.ts - VERSIÓN ACTUALIZADA
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('usuario') 
export class Usuario {
  @PrimaryColumn({ name: 'id_usuario', type: 'varchar', length: 11 }) // ✅ Carnet como PRIMARY KEY
  id_usuario: string;

  @Column({ name: 'nom_usuario'})
  nom_usuario: string;

  @Column({ name: 'contrasenna_usuario' })
  contrasenna_usuario: string;

  @Column({ name: 'rol_usuario', default: 'cliente' })
  rol_usuario: string;
}