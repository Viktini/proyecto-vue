import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  createUser(userData: any) {
    // Aquí iría la lógica para crear usuario
    console.log('Creando usuario:', userData);
    return { id: 1, ...userData };
  }
}