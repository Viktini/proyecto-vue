// src/areas/areas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AreasController } from './areas.controller';
import { AreasService } from './areas.service';
import { Area } from './entities/area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Area]),
    JwtModule, // ← Importar JwtModule para los guards
  ],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService]
})
export class AreasModule {}