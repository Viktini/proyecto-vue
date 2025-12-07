// src/areas/areas.service.ts - CORREGIDO
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';

@Injectable()
export class AreasService {
  private readonly logger = new Logger(AreasService.name);

  constructor(
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
  ) {}

  async obtenerAreas(): Promise<Area[]> {
    try {
      this.logger.log('Obteniendo áreas...');
      
      // OPCIÓN 1: Usar TypeORM find() (RECOMENDADO)
      this.logger.log('Usando consulta directa con TypeORM...');
      const areas = await this.areasRepository.find({
        order: {
          nom_area: 'ASC'
        }
      });
      
      this.logger.log(`✅ Se encontraron ${areas.length} áreas`);
      return areas;
      
    } catch (error) {
      this.logger.error('Error al obtener áreas:', error);
      throw new HttpException(
        'Error al obtener áreas: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerAreasConFuncion(): Promise<Area[]> {
    // OPCIÓN 2: Si necesitas usar la función PostgreSQL (ALTERNATIVA)
    try {
      this.logger.log('Obteniendo áreas con función PostgreSQL...');
      
      // Para funciones que retornan SETOF, usar esta sintaxis
      const areas = await this.areasRepository.query(
        `SELECT * FROM obtener_areas() AS (nom_area TEXT, cantidad_personal_fijo INTEGER)`
      );
      
      this.logger.log(`✅ Se encontraron ${areas.length} áreas con función`);
      return areas;
      
    } catch (error) {
      this.logger.error('Error con función PostgreSQL, usando consulta directa:', error);
      
      // Fallback a consulta directa
      return await this.areasRepository.find({
        order: {
          nom_area: 'ASC'
        }
      });
    }
  }

  async crearArea(areaData: any): Promise<any> {
    try {
      this.logger.log('➕ Creando área:', areaData);

      if (!areaData.nombre_area || !areaData.cantidad_personal_fijo) {
        throw new HttpException(
          'Faltan campos requeridos: nom_area y cantidad_personal_fijo',
          HttpStatus.BAD_REQUEST
        );
      }

      // OPCIÓN 1: Usar TypeORM save() (RECOMENDADO)
      const nuevaArea = this.areasRepository.create({
        nom_area: areaData.nom_area,
        cantidad_personal_fijo: parseInt(areaData.cantidad_personal_fijo)
      });

      const areaGuardada = await this.areasRepository.save(nuevaArea);
      
      this.logger.log('✅ Área creada exitosamente con TypeORM');
      
      return { 
        success: true,
        message: 'Área creada exitosamente',
        area: areaGuardada
      };

    } catch (error) {
      this.logger.error('💥 ERROR al crear área:', error);
      
      if (error.code === '23505') { // Violación de unique constraint
        throw new HttpException(
          'Ya existe un área con ese nombre',
          HttpStatus.BAD_REQUEST
        );
      }
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error al crear área: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async crearAreaConFuncion(areaData: any): Promise<any> {
    // OPCIÓN 2: Si necesitas usar la función PostgreSQL
    try {
      this.logger.log('➕ Creando área con función PostgreSQL...');

      if (!areaData.nom_area || !areaData.cantidad_personal_fijo) {
        throw new HttpException(
          'Faltan campos requeridos: nom_area y cantidad_personal_fijo',
          HttpStatus.BAD_REQUEST
        );
      }

      // Para funciones que no retornan cursor
      const result = await this.areasRepository.query(
        `SELECT insertar_area($1, $2) as success`,
        [areaData.nom_area, parseInt(areaData.cantidad_personal_fijo)]
      );
      
      this.logger.log('✅ Área creada exitosamente con función');
      
      return { 
        success: true,
        message: 'Área creada exitosamente',
        area: {
          nom_area: areaData.nom_area,
          cantidad_personal_fijo: parseInt(areaData.cantidad_personal_fijo)
        }
      };

    } catch (error) {
      this.logger.error('💥 ERROR al crear área con función:', error);
      throw new HttpException(
        'Error al crear área: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async actualizarArea(nombreArea: string, areaData: any): Promise<any> {
    try {
      this.logger.log(`✏️ Actualizando área ${nombreArea}`);

      // Usar TypeORM update
      const result = await this.areasRepository.update(
        { nom_area: nombreArea },
        { cantidad_personal_fijo: parseInt(areaData.cantidad_personal_fijo) }
      );
      
      if (result.affected === 0) {
        throw new HttpException('Área no encontrada', HttpStatus.NOT_FOUND);
      }
      
      this.logger.log('✅ Área actualizada exitosamente');
      return { 
        success: true,
        message: 'Área actualizada exitosamente'
      };

    } catch (error) {
      this.logger.error('Error al actualizar área:', error);
      throw new HttpException(
        'Error al actualizar área: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async eliminarArea(nombreArea: string): Promise<any> {
    try {
      this.logger.log(`🗑️ Eliminando área ${nombreArea}`);

      // Usar TypeORM delete
      const result = await this.areasRepository.delete({
        nom_area: nombreArea
      });
      
      if (result.affected === 0) {
        throw new HttpException('Área no encontrada', HttpStatus.NOT_FOUND);
      }
      
      this.logger.log('✅ Área eliminada exitosamente');
      return { 
        success: true, 
        message: 'Área eliminada exitosamente' 
      };

    } catch (error) {
      this.logger.error('Error al eliminar área:', error);
      throw new HttpException(
        'Error al eliminar área: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Método para diagnóstico
  async diagnosticarTabla(): Promise<any> {
    try {
      this.logger.log('🔍 Realizando diagnóstico de la tabla areas...');
      
      // Verificar si la tabla existe y tiene datos
      const count = await this.areasRepository.count();
      const todasLasAreas = await this.areasRepository.find();
      
      // Probar consulta SQL directa
      const resultadoRaw = await this.areasRepository.query(
        'SELECT * FROM area LIMIT 5'
      );
      
      return {
        totalAreas: count,
        areas: todasLasAreas,
        consultaRaw: resultadoRaw,
        tablaExiste: count >= 0
      };
      
    } catch (error) {
      this.logger.error('Error en diagnóstico:', error);
      return {
        error: error.message,
        tablaExiste: false
      };
    }
  }
}