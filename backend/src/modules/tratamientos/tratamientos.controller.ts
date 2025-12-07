// tratamientos.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { TratamientosService } from './tratamientos.service';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { ValidationPipe } from '../../common/pipes/validation.pipe';
import { Public } from '../../common/decorators/public.decorator'; // Añade esto

@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) { }

  // tratamientos.controller.ts - Añade transformación
  @Get()
  @Public()
  async getTratamientos() {
    const tratamientos = await this.tratamientosService.getTratamientos();

    // Transformar explícitamente para asegurar formato
    return tratamientos.map(tratamiento => ({
      cod_trat: tratamiento.cod_trat,
      nom_trat: tratamiento.nom_trat,
      categoria: tratamiento.categoria,
      descripcion: tratamiento.descripcion,
      duracion: Number(tratamiento.duracion),
      precio: Number(tratamiento.precio),
      frecuencia_mensual: tratamiento.frecuencia_mensual ? Number(tratamiento.frecuencia_mensual) : null,
      materiales_necesarios: tratamiento.materiales_necesarios
    }));
  }

  @Post()
  @UseGuards(JwtAuthGuard) // ← Solo POST, PUT, DELETE requieren auth
  @HttpCode(HttpStatus.CREATED)
  async createTratamiento(@Body(ValidationPipe) createTratamientoDto: CreateTratamientoDto) {
    return this.tratamientosService.createTratamiento(createTratamientoDto);
  }

  @Put(':codigo')
  @UseGuards(JwtAuthGuard)
  async updateTratamiento(
    @Param('codigo') codigo: string,
    @Body(ValidationPipe) updateTratamientoDto: UpdateTratamientoDto
  ) {
    return this.tratamientosService.updateTratamiento(codigo, updateTratamientoDto);
  }

  @Delete(':codigo')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTratamiento(@Param('codigo') codigo: string) {
    return this.tratamientosService.deleteTratamiento(codigo);
  }
}