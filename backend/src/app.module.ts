import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],       // Otros módulos que usa
  controllers: [AppController],  // Controladores
  providers: [AppService],       // Servicios
})
export class AppModule { }