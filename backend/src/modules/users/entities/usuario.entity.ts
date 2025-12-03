// usuario.entity.ts - VERSIÓN ACTUALIZADA
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('usuario') 
export class Usuario {
  @PrimaryColumn({ name: 'id_usuario' }) // ✅ Carnet como PRIMARY KEY
  id_usuario: number;

  @Column({ name: 'nom_usuario', unique: true })
  nom_usuario: string;

  @Column({ name: 'contrasenna_usuario' })
  contrasenna_usuario: string;

  @Column({ 
    name: 'rol_usuario',
    default: 'cliente' // ✅ Valor por defecto
  })
  rol_usuario: string;
}