// tratamientos.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TratamientosService } from './tratamientos.service';

@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

  @Get()
  async getTratamientos() {
    return this.tratamientosService.getTratamientos();
  }

  @Post()
  async createTratamiento(@Body() tratamientoData: any) {
    return this.tratamientosService.createTratamiento(tratamientoData);
  }

  @Put(':codigo')
  async updateTratamiento(@Param('codigo') codigo: string, @Body() tratamientoData: any) {
    return this.tratamientosService.updateTratamiento(codigo, tratamientoData);
  }

  @Delete(':codigo')
  async deleteTratamiento(@Param('codigo') codigo: string) {
    return this.tratamientosService.deleteTratamiento(codigo);
  }
}