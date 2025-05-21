import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { context, trace } from '@opentelemetry/api';
import { CustomHttpException } from '../exceptions/custom-exceptions';

/**
 * Filtro global para padronizar o formato das respostas de erro
 *
 * Este filtro diferencia entre:
 * 1. Exceções HTTP esperadas (como 400, 404, etc.)
 * 2. Erros reais da aplicação (erros de sistema, bugs, etc.)
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Verificar se é uma exceção HTTP ou um erro de aplicação
    const isHttpException = exception instanceof HttpException;

    // Obter o status code
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obter a mensagem de erro
    const message = isHttpException
      ? exception.getResponse()
      : exception.message || 'Erro interno no servidor';

    // Formatar a resposta de erro para garantir consistência
    const errorResponse = this.formatErrorResponse(
      status,
      message,
      exception,
      request,
    );

    // Tratar erros reais de aplicação vs exceções HTTP esperadas
    if (!isHttpException || status >= 500) {
      // ERRO REAL: Registrar como erro no trace e nos logs
      this.addErrorToTrace(exception, request.path, status);
      this.logApplicationError(exception, request, status);
    } else {
      // EXCEÇÃO HTTP: Registrar como evento normal no trace e log info/debug
      this.addExceptionEventToTrace(exception, request.path, status);
      this.logHttpException(exception, request, status);
    }

    // Retornar a resposta padronizada
    response.status(status).json(errorResponse);
  }

  /**
   * Formata a resposta de erro para um padrão consistente
   */
  private formatErrorResponse(
    status: number,
    message: any,
    exception: any,
    request: Request,
  ): any {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Se a mensagem já for um objeto, preservar sua estrutura
    if (typeof message === 'object' && !Array.isArray(message)) {
      return {
        statusCode: status,
        timestamp,
        path,
        ...message,
      };
    }

    // Se for um array de mensagens (comum em erros de validação)
    if (Array.isArray(message)) {
      return {
        statusCode: status,
        timestamp,
        path,
        messages: message,
        error: this.getErrorNameFromStatus(status),
      };
    }

    // Caso simples: mensagem de string
    return {
      statusCode: status,
      timestamp,
      path,
      message: message,
      error: this.getErrorNameFromStatus(status),
    };
  }

  /**
   * Adiciona informações de ERRO ao trace atual
   * Usado para erros reais da aplicação (não-HTTP ou 5xx)
   */
  private addErrorToTrace(exception: any, path: string, status: number): void {
    const currentSpan = trace.getSpan(context.active());
    if (!currentSpan) return;

    // Marcar como erro real no trace
    currentSpan.setAttribute('error', true);
    currentSpan.setAttribute('error.type', exception.name || 'Error');
    currentSpan.setAttribute(
      'error.message',
      exception.message || 'Unknown error',
    );
    currentSpan.setAttribute('error.status_code', status);
    currentSpan.setAttribute('error.path', path);

    if (exception.stack) {
      currentSpan.setAttribute('error.stack', exception.stack);
    }

    // Adicionar detalhes personalizados se disponíveis
    if (exception instanceof CustomHttpException && exception.details) {
      currentSpan.setAttribute(
        'error.details',
        JSON.stringify(exception.details),
      );
    }
  }

  /**
   * Adiciona informações de EXCEÇÃO HTTP ao trace atual como evento
   * Usado para exceções HTTP esperadas (4xx, exceto 5xx)
   */
  private addExceptionEventToTrace(
    exception: any,
    path: string,
    status: number,
  ): void {
    const currentSpan = trace.getSpan(context.active());
    if (!currentSpan) return;

    // Registrar como evento, não como erro
    currentSpan.addEvent('http.exception', {
      'exception.type': exception.name || 'HttpException',
      'exception.message': exception.message || 'Unknown exception',
      'exception.status_code': status,
      'exception.path': path,
    });

    // Adicionar detalhes personalizados se disponíveis
    if (exception instanceof CustomHttpException && exception.details) {
      currentSpan.addEvent('exception.details', {
        details: JSON.stringify(exception.details),
      });
    }
  }

  /**
   * Loga ERROS DE APLICAÇÃO com alta severidade
   * Usado para erros reais (não-HTTP ou 5xx)
   */
  private logApplicationError(
    exception: any,
    request: Request,
    status: number,
  ): void {
    const requestInfo = `${request.method} ${request.url}`;
    const errorMessage = `ERRO DE APLICAÇÃO: ${requestInfo} - ${status}: ${exception.message || 'Erro desconhecido'}`;

    // Sempre logar erros de aplicação como ERROR
    this.logger.error(errorMessage, exception.stack);
  }

  /**
   * Loga EXCEÇÕES HTTP com nível apropriado
   * Usado para exceções HTTP esperadas (4xx, exceto 5xx)
   */
  private logHttpException(
    exception: any,
    request: Request,
    status: number,
  ): void {
    const requestInfo = `${request.method} ${request.url}`;

    // Formatar mensagem de log baseada no tipo de resposta
    let logMessage = '';
    if (
      typeof exception.getResponse === 'function' &&
      typeof exception.getResponse() === 'object' &&
      exception.getResponse().message
    ) {
      // Para exceções NestJS com objeto de resposta
      const responseObj = exception.getResponse();
      logMessage = `${requestInfo} - ${status}: ${
        Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message
      }`;
    } else {
      // Para exceções com mensagem simples
      logMessage = `${requestInfo} - ${status}: ${exception.message || 'Desconhecido'}`;
    }

    // Diferentes níveis de log baseado no tipo de exceção HTTP
    if (status === 429) {
      // Too Many Requests - importante monitorar
      this.logger.warn(`Rate limit excedido: ${logMessage}`);
    } else if (status === 401 || status === 403) {
      // Unauthorized/Forbidden - questões de segurança
      this.logger.warn(`Acesso negado: ${logMessage}`);
    } else if (status === 404) {
      // Not Found - geralmente não é crítico
      this.logger.debug(`Recurso não encontrado: ${logMessage}`);
    } else {
      // Outros códigos 4xx - info apenas
      this.logger.log(`Exceção HTTP: ${logMessage}`);
    }
  }

  /**
   * Retorna o nome do erro baseado no status HTTP
   */
  private getErrorNameFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.BAD_GATEWAY:
        return 'Bad Gateway';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'Gateway Timeout';
      default:
        return 'Error';
    }
  }
}
