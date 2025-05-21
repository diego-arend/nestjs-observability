import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { shouldSkipMonitoring } from '../filters/filter-endpoints';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TraceIdInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const request = ctx.switchToHttp().getRequest();
    const { path } = request;

    // Verificar se esse endpoint deve ser ignorado para traces
    if (shouldSkipMonitoring(path)) {
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
          }
        },
      ),
    );
  }
}
