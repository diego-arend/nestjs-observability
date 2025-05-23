import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLoggerService } from '../logger/pino-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const method = request.method;
    const path = request.route?.path || request.url;
    const normalizedPath = '/' + path.replace(/^\/|\/$/g, '');
    const statusCode = status.toString();

    // Logar o erro
    this.logger.error(
      `Erro na requisição: ${method} ${normalizedPath} - Status: ${statusCode}`,
      exception.stack,
    );

    // Nota: As métricas serão registradas pelo MetricsInterceptor

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    });
  }
}
