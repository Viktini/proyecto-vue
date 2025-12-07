// tratamientos.service.ts - CORREGIDO
import { Injectable, Logger, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tratamiento } from './entities/tratamiento.entity';
import { AreasService } from '../areas/areas.service';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';

@Injectable()
export class TratamientosService {
  private readonly logger = new Logger(TratamientosService.name);

  constructor(
    @InjectRepository(Tratamiento)
    private tratamientosRepository: Repository<Tratamiento>,
    private areasService: AreasService
  ) { }

  // En tratamientos.service.ts - método getTratamientos
  // tratamientos.service.ts - CORRIGE el método getTratamientos
async getTratamientos(): Promise<any[]> {
  try {
    this.logger.log('Obteniendo tratamientos...');
    
    // Usa getRawAndEntities para debug
    const queryBuilder = this.tratamientosRepository
      .createQueryBuilder('tratamiento')
      .orderBy('tratamiento.cod_trat', 'ASC');
    
    // Ejecutar y transformar explícitamente
    const tratamientos = await queryBuilder.getMany();
    
    this.logger.log(`✅ Se encontraron ${tratamientos.length} tratamientos`);
    
    // 🔍 DEBUG: Mostrar estructura real
    if (tratamientos.length > 0) {
      const primerTratamiento = tratamientos[0];
      console.log('🔍 Estructura del primer tratamiento:', {
        keys: Object.keys(primerTratamiento),
        values: primerTratamiento,
        tipo: typeof primerTratamiento
      });
      
      // Asegurar que los campos están correctamente mapeados
      const tratamientosTransformados = tratamientos.map(tratamiento => ({
        cod_trat: tratamiento.cod_trat,
        nom_trat: tratamiento.nom_trat,
        categoria: tratamiento.categoria,
        descripcion: tratamiento.descripcion,
        duracion: tratamiento.duracion,
        precio: tratamiento.precio,
        frecuencia_mensual: tratamiento.frecuencia_mensual,
        materiales_necesarios: tratamiento.materiales_necesarios
      }));
      
      return tratamientosTransformados;
    }
    
    return tratamientos;
    
  } catch (error) {
    this.logger.error('Error al obtener tratamientos:', error);
    throw new HttpException(
      'Error al obtener tratamientos: ' + error.message,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

  async getCategoriasValidas(): Promise<string[]> {
    try {
      const areas = await this.areasService.obtenerAreas();
      return areas.map((area: any) => area.nombre_area);
    } catch (error) {
      this.logger.warn('No se pudieron obtener áreas, usando valores por defecto');
      return ['Masajes', 'Faciales', 'Manos y Pies', 'Corporales', 'Especiales'];
    }
  }

  async createTratamiento(createTratamientoDto: CreateTratamientoDto): Promise<any> {
    try {
      this.logger.log('➕ Creando tratamiento:', createTratamientoDto);

      // Obtener categorías válidas (áreas existentes)
      const categoriasValidas = await this.getCategoriasValidas();

      // Validar que la categoría sea un área existente
      if (!categoriasValidas.includes(createTratamientoDto.categoria)) {
        throw new HttpException(
          `Categoría inválida. El área "${createTratamientoDto.categoria}" no existe. Áreas disponibles: ${categoriasValidas.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Generar código automáticamente
      const lastTreatment = await this.tratamientosRepository
        .createQueryBuilder('tratamiento')
        .orderBy('tratamiento.codigo_trat', 'DESC')
        .getOne();

      let nextCode = 'T001';
      if (lastTreatment && lastTreatment.cod_trat) {
        const lastNumber = parseInt(lastTreatment.cod_trat.substring(1)) || 0;
        nextCode = 'T' + (lastNumber + 1).toString().padStart(3, '0');
      }

      // Crear tratamiento con TypeORM
      const nuevoTratamiento = this.tratamientosRepository.create({
        cod_trat: nextCode,
        nom_trat: createTratamientoDto.nom_trat,
        categoria: createTratamientoDto.categoria,
        descripcion: createTratamientoDto.descripcion,
        duracion: createTratamientoDto.duracion,
        precio: createTratamientoDto.precio,
        frecuencia_mensual: createTratamientoDto.frecuencia_mensual || null,
        materiales_necesarios: createTratamientoDto.materiales_necesarios || null
      });

      const tratamientoGuardado = await this.tratamientosRepository.save(nuevoTratamiento);

      this.logger.log('✅ Tratamiento creado exitosamente');

      return {
        success: true,
        message: 'Tratamiento creado exitosamente',
        tratamiento: tratamientoGuardado
      };

    } catch (error) {
      this.logger.error('💥 ERROR al crear tratamiento:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error al crear tratamiento: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateTratamiento(codigo: string, updateTratamientoDto: UpdateTratamientoDto): Promise<any> {
    try {
      this.logger.log(`✏️ Actualizando tratamiento ${codigo}`);

      // Verificar si el tratamiento existe
      const tratamientoExistente = await this.tratamientosRepository.findOne({
        where: { cod_trat: codigo }
      });

      if (!tratamientoExistente) {
        throw new NotFoundException(`Tratamiento con código ${codigo} no encontrado`);
      }

      // Validar categoría si se está actualizando
      if (updateTratamientoDto.categoria) {
        const categoriasValidas = await this.getCategoriasValidas();
        if (!categoriasValidas.includes(updateTratamientoDto.categoria)) {
          throw new HttpException(
            `Categoría inválida. El área "${updateTratamientoDto.categoria}" no existe.`,
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Actualizar tratamiento
      await this.tratamientosRepository.update(
        { cod_trat: codigo },
        {
          ...updateTratamientoDto,
          // Asegurar que los valores numéricos sean correctos
          duracion: updateTratamientoDto.duracion ? Number(updateTratamientoDto.duracion) : undefined,
          precio: updateTratamientoDto.precio ? Number(updateTratamientoDto.precio) : undefined,
          frecuencia_mensual: updateTratamientoDto.frecuencia_mensual ? Number(updateTratamientoDto.frecuencia_mensual) : undefined
        }
      );

      // Obtener el tratamiento actualizado
      const tratamientoActualizado = await this.tratamientosRepository.findOne({
        where: { cod_trat: codigo }
      });

      this.logger.log('✅ Tratamiento actualizado exitosamente');

      return {
        success: true,
        message: 'Tratamiento actualizado exitosamente',
        tratamiento: tratamientoActualizado
      };

    } catch (error) {
      this.logger.error('Error al actualizar tratamiento:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error al actualizar tratamiento: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteTratamiento(codigo: string): Promise<any> {
    try {
      this.logger.log(`🗑️ Eliminando tratamiento ${codigo}`);

      // Verificar si el tratamiento existe
      const tratamientoExistente = await this.tratamientosRepository.findOne({
        where: { cod_trat: codigo }
      });

      if (!tratamientoExistente) {
        throw new NotFoundException(`Tratamiento con código ${codigo} no encontrado`);
      }

      // Eliminar tratamiento
      await this.tratamientosRepository.delete({ cod_trat: codigo });

      this.logger.log('✅ Tratamiento eliminado exitosamente');

      return {
        success: true,
        message: 'Tratamiento eliminado exitosamente'
      };

    } catch (error) {
      this.logger.error('Error al eliminar tratamiento:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error al eliminar tratamiento: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}