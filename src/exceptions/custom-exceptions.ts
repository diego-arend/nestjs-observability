import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Classe base para exceções personalizadas
 */
export class CustomHttpException extends HttpException {
  constructor(
    response: string | Record<string, any>,
    status: number,
    public readonly details?: any,
  ) {
    super(response, status);
  }
}

/**
 * Exceção de Bad Request (400) padronizada
 */
export class BadRequestException extends CustomHttpException {
  constructor(
    message: string | object = 'Dados inválidos na requisição',
    public readonly details?: any,
  ) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Exceção de Not Found (404) padronizada
 */
export class NotFoundException extends CustomHttpException {
  constructor(
    entityName: string,
    identifier?: string | number,
    public readonly details?: any,
  ) {
    const message = identifier
      ? `${entityName} com identificador ${identifier} não encontrado(a)`
      : `${entityName} não encontrado(a)`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exceção de Conflict (409) padronizada
 */
export class ConflictException extends CustomHttpException {
  constructor(
    entityName: string,
    fieldName: string,
    value: string | number,
    public readonly details?: any,
  ) {
    super(
      `${entityName} com ${fieldName} '${value}' já existe`,
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Exceção de Unauthorized (401) padronizada
 */
export class UnauthorizedException extends CustomHttpException {
  constructor(
    message: string = 'Não autorizado',
    public readonly details?: any,
  ) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * Exceção de Forbidden (403) padronizada
 */
export class ForbiddenException extends CustomHttpException {
  constructor(
    message: string = 'Acesso negado',
    public readonly details?: any,
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * Exceção de Internal Server Error (500) padronizada
 */
export class InternalServerErrorException extends CustomHttpException {
  constructor(
    message: string = 'Erro interno no servidor',
    public readonly details?: any,
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
