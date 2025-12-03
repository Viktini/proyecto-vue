// src/areas/areas.controller.ts - CON GUARDS
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AreasService } from './areas.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard) // ← Múltiples guards
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  async getAreas() {
    return this.areasService.obtenerAreas();
  }

  @Get('diagnostico')
  @Roles('admin') // ← Solo admin puede acceder
  async diagnosticar() {
    return this.areasService.diagnosticarTabla();
  }

  @Post()
  @Roles('admin')
  async createArea(@Body() areaData: any) {
    return this.areasService.crearArea(areaData);
  }

  @Put(':nombre')
  @Roles('admin')
  async updateArea(@Param('nombre') nombre: string, @Body() areaData: any) {
    return this.areasService.actualizarArea(nombre, areaData);
  }

  @Delete(':nombre')
  @Roles('admin')
  async deleteArea(@Param('nombre') nombre: string) {
    return this.areasService.eliminarArea(nombre);
  }
}