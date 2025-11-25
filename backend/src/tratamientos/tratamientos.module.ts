// tratamientos.module.ts - CORREGIDO
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TratamientosController } from './tratamientos.controller';
import { TratamientosService } from './tratamientos.service';
import { Tratamiento } from './entities/tratamiento.entity';
import { AreasModule } from '../areas/areas.module'; // NUEVO: Importar AreasModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Tratamiento]),
    AreasModule, // NUEVO: Importar el módulo de áreas
  ],
  controllers: [TratamientosController],
  providers: [TratamientosService]
})
export class TratamientosModule {}