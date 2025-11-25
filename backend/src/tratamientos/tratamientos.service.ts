// tratamientos.service.ts - CORREGIDO
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tratamiento } from './entities/tratamiento.entity';
import { AreasService } from '../areas/areas.service'; // Importar correctamente

@Injectable()
export class TratamientosService {
  private readonly logger = new Logger(TratamientosService.name);

  constructor(
    @InjectRepository(Tratamiento)
    private tratamientosRepository: Repository<Tratamiento>,
    private areasService: AreasService // Inyectar el servicio de áreas
  ) {}

  async getTratamientos(): Promise<Tratamiento[]> {
    try {
      this.logger.log('Obteniendo tratamientos...');
      
      const tratamientos = await this.tratamientosRepository.find({
        order: { codigo_tratamiento: 'ASC' }
      });
      
      this.logger.log(`✅ Se encontraron ${tratamientos.length} tratamientos`);
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

  async createTratamiento(tratamientoData: any): Promise<any> {
    try {
      this.logger.log('➕ Creando tratamiento:', tratamientoData);

      // Validar datos requeridos
      if (!tratamientoData.nombre_tratamiento || !tratamientoData.categoria || 
          !tratamientoData.descripcion || !tratamientoData.duracion || !tratamientoData.precio) {
        throw new HttpException(
          'Faltan campos requeridos: nombre, categoría, descripción, duración y precio',
          HttpStatus.BAD_REQUEST
        );
      }

      // Obtener categorías válidas (áreas existentes)
      const categoriasValidas = await this.getCategoriasValidas();
      
      // Validar que la categoría sea un área existente
      if (!categoriasValidas.includes(tratamientoData.categoria)) {
        throw new HttpException(
          `Categoría inválida. El área "${tratamientoData.categoria}" no existe. Áreas disponibles: ${categoriasValidas.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Generar código automáticamente
      const lastTreatment = await this.tratamientosRepository
        .createQueryBuilder('tratamiento')
        .orderBy('tratamiento.codigo_tratamiento', 'DESC')
        .getOne();
      
      let nextCode = 'T001';
      if (lastTreatment && lastTreatment.codigo_tratamiento) {
        const lastNumber = parseInt(lastTreatment.codigo_tratamiento.substring(1)) || 0;
        nextCode = 'T' + (lastNumber + 1).toString().padStart(3, '0');
      }

      // Crear tratamiento con TypeORM
      const nuevoTratamiento = this.tratamientosRepository.create({
        codigo_tratamiento: nextCode,
        nombre_tratamiento: tratamientoData.nombre_tratamiento,
        categoria: tratamientoData.categoria,
        descripcion: tratamientoData.descripcion,
        duracion: parseFloat(tratamientoData.duracion),
        precio: parseFloat(tratamientoData.precio),
        frecuencia_mensual: tratamientoData.frecuencia_mensual ? parseInt(tratamientoData.frecuencia_mensual) : null,
        materiales_necesarios: tratamientoData.materiales_necesarios || null
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

  async updateTratamiento(codigo: string, tratamientoData: any): Promise<any> {
    try {
      this.logger.log(`✏️ Actualizando tratamiento ${codigo}`);

      const result = await this.tratamientosRepository.query(
        `SELECT actualizar_tratamiento($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          codigo,
          tratamientoData.nombre_tratamiento,
          tratamientoData.categoria,
          tratamientoData.descripcion,
          parseFloat(tratamientoData.duracion),
          parseFloat(tratamientoData.precio),
          tratamientoData.frecuencia_mensual ? parseInt(tratamientoData.frecuencia_mensual) : null,
          tratamientoData.materiales_necesarios || null
        ]
      );

      this.logger.log('✅ Tratamiento actualizado con función PostgreSQL');
      return {
        success: true,
        message: 'Tratamiento actualizado exitosamente'
      };

    } catch (error) {
      this.logger.error('Error al actualizar tratamiento:', error);
      throw new HttpException(
        'Error al actualizar tratamiento: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteTratamiento(codigo: string): Promise<any> {
    try {
      this.logger.log(`🗑️ Eliminando tratamiento ${codigo}`);

      const result = await this.tratamientosRepository.query(
        `SELECT eliminar_tratamiento($1)`,
        [codigo]
      );

      this.logger.log('✅ Tratamiento eliminado con función PostgreSQL');
      return {
        success: true,
        message: 'Tratamiento eliminado exitosamente'
      };

    } catch (error) {
      this.logger.error('Error al eliminar tratamiento:', error);
      throw new HttpException(
        'Error al eliminar tratamiento: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}