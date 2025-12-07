import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validar que el contenido sea JSON si se especifica
    if (req.headers['content-type'] && 
        req.headers['content-type'].includes('application/json') && 
        Object.keys(req.body).length > 0) {
      
      try {
        // NestJS ya parsea JSON, pero podemos agregar validaciones adicionales
        this.validateRequestBody(req.body);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    next();
  }

  private validateRequestBody(body: any) {
    // Validaciones personalizadas según tus necesidades
    if (body && typeof body === 'object') {
      // Ejemplo: validar que no vengan campos con solo espacios
      for (const key in body) {
        if (typeof body[key] === 'string' && body[key].trim() === '') {
          throw new Error(`El campo ${key} no puede estar vacío`);
        }
      }
    }
  }
}