// src/common/filters/all-exceptions.filter.ts - CREAR
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: any = 'Internal server error';
      let error = 'Internal Server Error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
          error = exceptionResponse;
        } else if (typeof exceptionResponse === 'object') {
          message = (exceptionResponse as any).message || exceptionResponse;
          error = (exceptionResponse as any).error || 'Http Exception';
        }
      } else if (exception instanceof Error) {
        message = exception.message;
        error = exception.name;
      }
  
      // Log del error
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
  
      // Respuesta estructurada
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: Array.isArray(message) ? message : [message],
        error,
      });
    }
  }