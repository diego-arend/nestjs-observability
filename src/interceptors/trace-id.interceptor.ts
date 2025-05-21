import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { shouldSkipMonitoring } from '../filters/filter-endpoints';
import { PinoLoggerService } from '../logger/pino-logger.service';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLoggerService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const request = ctx.switchToHttp().getRequest();
    const path = request.route?.path || request.path;

    // Normalizar o path - garantir que comece com barra e não tenha barra no final
    const normalizedPath = '/' + path.replace(/^\/|\/$/g, '');

    // Verificar se esse endpoint deve ser ignorado para traces
    if (shouldSkipMonitoring(normalizedPath)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(
        // On success
        () => {
          const response = ctx.switchToHttp().getResponse();

          // Obter o span atual e seu TraceID
          const currentSpan = trace.getSpan(context.active());
          if (currentSpan) {
            const spanContext = currentSpan.spanContext();
            const traceId = spanContext.traceId;

            // Adicionar o TraceID ao cabeçalho da resposta
            response.setHeader('X-Trace-ID', traceId);

            // Também podemos adicionar mais atributos ao span
            currentSpan.setAttribute('http.path', normalizedPath);
            currentSpan.setAttribute('http.method', request.method);

            // Log para debug com trace_id
            this.logger.debug(
              `Requisição processada: ${request.method} ${normalizedPath}`,
              'TraceIdInterceptor',
              { trace_id: traceId },
            );
          }
        },
        // On error - opcional para melhorar o tratamento de erro nos traces
        (error) => {
          const currentSpan = trace.getSpan(context.active());
          if (currentSpan) {
            currentSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message || 'Unknown error',
            });

            // Adicionar detalhes relevantes do erro
            currentSpan.setAttribute('error.type', error.name || 'Error');
            currentSpan.setAttribute(
              'error.message',
              error.message || 'Unknown error',
            );
            if (error.stack) {
              currentSpan.setAttribute('error.stack', error.stack);
            }

            // Não precisa logar o erro aqui já que o filtro de exceção fará isso
          }
        },
      ),
    );
  }
}
