// src/common/middleware/logger.middleware.ts - CREAR
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log de entrada
    this.logger.log(`${method} ${originalUrl} - ${userAgent} ${ip}`);

    // Capturar respuesta
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      if (statusCode >= 400) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} ${duration}ms - ${contentLength || 0}b`,
        );
      } else {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${duration}ms - ${contentLength || 0}b`,
        );
      }
    });

    next();
  }
}