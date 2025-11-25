// src/areas/areas.controller.ts - ACTUALIZADO
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AreasService } from './areas.service';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  async getAreas() {
    return this.areasService.obtenerAreas();
  }

  @Get('diagnostico')
  async diagnosticar() {
    return this.areasService.diagnosticarTabla();
  }

  @Post()
  async createArea(@Body() areaData: any) {
    return this.areasService.crearArea(areaData);
  }

  @Put(':nombre')
  async updateArea(@Param('nombre') nombre: string, @Body() areaData: any) {
    return this.areasService.actualizarArea(nombre, areaData);
  }

  @Delete(':nombre')
  async deleteArea(@Param('nombre') nombre: string) {
    return this.areasService.eliminarArea(nombre);
  }
}