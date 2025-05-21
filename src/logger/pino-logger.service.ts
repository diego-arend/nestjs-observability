import { Injectable, LoggerService } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';
import pino from 'pino';
import { createLoggerTransport } from './loki-transport';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private logger: pino.Logger;

  constructor() {
    // Obtém o transport configurado
    const transport = createLoggerTransport();

    // Configuração comum do logger
    const loggerConfig: pino.LoggerOptions = {
      level: process.env.LOG_LEVEL || 'info',
      base: {
        app: process.env.OTEL_SERVICE_NAME || 'nest-app',
        env: process.env.NODE_ENV || 'development',
      },
      timestamp: pino.stdTimeFunctions.isoTime,

      // Serialização segura para objetos complexos
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        // Garantir que objetos complexos sejam serializados corretamente
        additionalData: (obj) => {
          if (!obj) return obj;
          try {
            return JSON.parse(JSON.stringify(obj));
          } catch (e) {
            return {
              error: 'Could not serialize object',
              original: String(obj),
            };
          }
        },
      },
    };

    // Adiciona formatadores apenas se não estiver usando transport multi
    if (!transport || !('targets' in transport)) {
      loggerConfig.formatters = {
        level: (label) => {
          return { level: label };
        },
      };
    }

    // Adiciona o transport às configurações
    if (transport) {
      loggerConfig.transport = transport;
    }

    // Inicializa o logger
    this.logger = pino(loggerConfig);
  }

  /**
   * Extrai o trace ID do contexto atual do OpenTelemetry
   */
  private getTraceId(): string | undefined {
    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) {
      const spanContext = currentSpan.spanContext();
      return spanContext.traceId;
    }
    return undefined;
  }

  /**
   * Adiciona metadados padrão e trace ID aos logs, garantindo que sejam serializáveis
   */
  private enhanceLogObject(
    message: any,
    context?: string,
    additionalData?: Record<string, any>,
  ): object {
    // Extrair o trace ID atual
    const traceId = this.getTraceId();

    // Garantir que a mensagem seja serializável
    const safeMessage =
      typeof message === 'object' ? JSON.stringify(message) : String(message);

    // Base do objeto de log
    const logObject: Record<string, any> = {
      msg: safeMessage,
      context: context || 'Application',
    };

    // Adicionar trace ID apenas se existir (evitar campos nulos)
    if (traceId) {
      logObject.trace_id = traceId;
    }

    // Adicionar dados extras de forma segura
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        // Evitar sobreposição com campos reservados
        const safeKey =
          key === 'message' || key === 'msg' ? 'data_' + key : key;

        // Garantir que valores complexos sejam serializáveis
        const value = additionalData[key];

        if (typeof value === 'object' && value !== null) {
          try {
            logObject[safeKey] = JSON.parse(JSON.stringify(value));
          } catch (e) {
            logObject[safeKey] = String(value);
          }
        } else {
          logObject[safeKey] = value;
        }
      });
    }

    return logObject;
  }

  log(
    message: any,
    context?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logger.info(this.enhanceLogObject(message, context, additionalData));
  }

  error(
    message: any,
    trace?: string,
    context?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logger.error(
      this.enhanceLogObject(message, context, {
        ...additionalData,
        stack_trace: trace ? String(trace) : undefined,
      }),
    );
  }

  warn(
    message: any,
    context?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logger.warn(this.enhanceLogObject(message, context, additionalData));
  }

  debug(
    message: any,
    context?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logger.debug(this.enhanceLogObject(message, context, additionalData));
  }

  verbose(
    message: any,
    context?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.logger.trace(this.enhanceLogObject(message, context, additionalData));
  }

  /**
   * Criar um logger filho com um contexto específico
   */
  createChildLogger(context: string): PinoLoggerService {
    const childLogger = new PinoLoggerService();
    childLogger.logger = this.logger.child({ context });
    return childLogger;
  }
}
