// src/modules/users/entities/user.entity.ts - ÚLTIMA VERIFICACIÓN
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    name: 'nombre_completo',
    type: 'varchar', 
    length: 255
  })
  fullName: string;

  @Column({ 
    name: 'gmail',
    type: 'varchar', 
    length: 255,
    unique: true 
  })
  gmail: string;

  @Column({ 
    name: 'nom_usuario',
    type: 'varchar', 
    length: 100,
    unique: true 
  })
  username: string;

  @Column({ 
    name: 'contrasenna_usuario',
    type: 'varchar', 
    length: 255 
  })
  password: string;

  @Column({ 
    name: 'rol_usuario',
    type: 'varchar', 
    length: 50,
    default: 'cliente'
  })
  role: string;

  @Column({ 
    name: 'token_actualizacion',
    type: 'varchar', 
    length: 500,
    nullable: true 
  })
  refreshToken: string;

  @CreateDateColumn({ 
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  // Hash automático de password
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}