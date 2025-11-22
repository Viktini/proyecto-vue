import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()  // Las rutas empiezan desde /
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()        // GET /
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('users')  // POST /users
  createUser(@Body() userData: any) {
    return this.appService.createUser(userData);
  }
}