import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paquete } from './entities/paquete.entity';
import { PaqueteTratamiento } from './entities/paquete-tratamiento.entity';
import { Tratamiento } from '../tratamientos/entities/tratamiento.entity';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/update-paquete.dto';
import { CreatePaqueteTratamientoDto } from './dto/create-paquete-tratamiento.dto';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private paquetesRepository: Repository<Paquete>,
    
    @InjectRepository(PaqueteTratamiento)
    private paqueteTratamientoRepository: Repository<PaqueteTratamiento>,
    
    @InjectRepository(Tratamiento)
    private tratamientosRepository: Repository<Tratamiento>,
  ) {}

  // 1. Crear un paquete (solo datos básicos)
// 1. CREATE - Esto SÍ funcionará
async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
  const paquete = this.paquetesRepository.create(createPaqueteDto);
  return await this.paquetesRepository.save(paquete);
}

// 2. ADD TRATAMIENTOS - También funcionará
async addTratamientos(
  paqueteId: string, 
  tratamientosDto: CreatePaqueteTratamientoDto[]
): Promise<PaqueteTratamiento[]> {
  const paquete = await this.paquetesRepository.findOne({
    where: { cod_paquete: paqueteId }
  });

  if (!paquete) {
    throw new NotFoundException(`Paquete con ID ${paqueteId} no encontrado`);
  }

  const relacionesCreadas: PaqueteTratamiento[] = [];

  for (const dto of tratamientosDto) {
    const tratamiento = await this.tratamientosRepository.findOne({
      where: { cod_trat: dto.tratamiento_id }
    });

    if (!tratamiento) {
      throw new NotFoundException(
        `Tratamiento con ID ${dto.tratamiento_id} no encontrado`
      );
    }

    // IMPORTANTE: Usar los nombres CORRECTOS de las propiedades
    const relacionExistente = await this.paqueteTratamientoRepository.findOne({
      where: {
        paqueteId: paqueteId,           // ← paqueteId si es camelCase
        tratamientoId: dto.tratamiento_id  // ← tratamientoId si es camelCase
      }
    });

    if (relacionExistente) {
      continue;
    }

    // Crear con los nombres CORRECTOS
    const relacion = this.paqueteTratamientoRepository.create({
      paqueteId: paqueteId,              // ← paqueteId
      tratamientoId: dto.tratamiento_id,  // ← tratamientoId
      paquete: paquete,
      tratamiento: tratamiento,
    });

    const savedRelacion = await this.paqueteTratamientoRepository.save(relacion);
    relacionesCreadas.push(savedRelacion);
  }

  return relacionesCreadas;
}
  // 3. Obtener todos los paquetes
  async findAll(): Promise<Paquete[]> {
    return await this.paquetesRepository.find({
      relations: ['tratamientos', 'tratamientos.tratamiento']
    });
  }

  // 4. Obtener un paquete específico con sus tratamientos
  async findOne(cod_paquete: string): Promise<Paquete> {
    const paquete = await this.paquetesRepository.findOne({
      where: { cod_paquete },
      relations: ['tratamientos', 'tratamientos.tratamiento']
    });

    if (!paquete) {
      throw new NotFoundException(`Paquete con ID ${cod_paquete} no encontrado`);
    }

    return paquete;
  }

  // 5. Obtener tratamientos de un paquete específico
  async getTratamientosDelPaquete(cod_paquete: string): Promise<PaqueteTratamiento[]> {
    // Verificar que el paquete existe
    const paqueteExiste = await this.paquetesRepository.findOne({
      where: { cod_paquete }
    });

    if (!paqueteExiste) {
      throw new NotFoundException(`Paquete con ID ${cod_paquete} no encontrado`);
    }

    return await this.paqueteTratamientoRepository.find({
      where: { paquete: { cod_paquete} },
      relations: ['tratamiento'],
    });
  }

  // 6. Actualizar un paquete
  async update(cod_paquete: string, updatePaqueteDto: UpdatePaqueteDto): Promise<Paquete> {
    const paquete = await this.findOne(cod_paquete);
    
    // Actualizar campos
    Object.assign(paquete, updatePaqueteDto);
    
    return await this.paquetesRepository.save(paquete);
  }

  // 7. Eliminar un paquete (eliminará también las relaciones por CASCADE)
  async remove(cod_paquete: string): Promise<void> {
    const result = await this.paquetesRepository.delete(cod_paquete);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Paquete con ID ${cod_paquete} no encontrado`);
    }
  }

  // 8. Opcional: Eliminar un tratamiento específico de un paquete
  async removeTratamientoDePaquete(
    cod_paquete: string, 
    cod_trat: string
  ): Promise<void> {
    const result = await this.paqueteTratamientoRepository.delete({
      paquete: { cod_paquete },
      tratamiento: { cod_trat }
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Relación entre paquete ${cod_paquete} y tratamiento ${cod_trat} no encontrada`
      );
    }
  }
}
