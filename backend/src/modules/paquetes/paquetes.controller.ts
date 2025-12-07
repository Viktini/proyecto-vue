import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { PaquetesService } from './paquetes.service';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/update-paquete.dto';
import { CreatePaqueteTratamientoDto } from './dto/create-paquete-tratamiento.dto';

@Controller('paquetes')
export class PaquetesController {
  constructor(private readonly paquetesService: PaquetesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createPaqueteDto: CreatePaqueteDto) {
    return this.paquetesService.create(createPaqueteDto);
  }

  // Nuevo endpoint: Agregar tratamientos a un paquete específico
  @Post(':cod_paquete/tratamientos')
  @UsePipes(new ValidationPipe({ transform: true }))
  addTratamientos(
    @Param('cod_paquete') id_paquete: string,
    @Body() tratamientos: CreatePaqueteTratamientoDto[]
  ) {
    return this.paquetesService.addTratamientos(id_paquete, tratamientos);
  }

  @Get()
  findAll() {
    return this.paquetesService.findAll();
  }

  @Get(':cod_paquete')
  findOne(@Param('cod_paquete') id_paquete: string) {
    return this.paquetesService.findOne(id_paquete);
  }

  // También puedes agregar un endpoint para obtener tratamientos de un paquete
  @Get(':cod_paquete/tratamientos')
  getTratamientos(@Param('cod_paquete') id_paquete: string) {
    return this.paquetesService.getTratamientosDelPaquete(id_paquete);
  }

  @Patch(':cod_paquete')
  update(@Param('cod_paquete') id_paquete: string, @Body() updatePaqueteDto: UpdatePaqueteDto) {
    return this.paquetesService.update(id_paquete, updatePaqueteDto);
  }

  @Delete(':cod_paquete')
  remove(@Param('cod_paquete') id_paquete: string) {
    return this.paquetesService.remove(id_paquete);
  }
}