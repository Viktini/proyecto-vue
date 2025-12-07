import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entities/paquete.entity';
import { PaqueteTratamiento } from './entities/paquete-tratamiento.entity';
import { Tratamiento } from '../tratamientos/entities/tratamiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, PaqueteTratamiento, Tratamiento]),
  ],
  controllers: [PaquetesController],
  providers: [PaquetesService],
})
export class PaquetesModule {}