import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TratamientosController } from './tratamientos.controller';
import { TratamientosService } from './tratamientos.service';
import { Tratamiento } from './entities/tratamiento.entity';
import { AreasModule } from '../areas/areas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tratamiento]),
    AreasModule,
    JwtModule, // ← Importar JwtModule para los guards
  ],
  controllers: [TratamientosController],
  providers: [TratamientosService]
})
export class TratamientosModule {}