// src/interceptors/trace-id.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { context, trace } from '@opentelemetry/api';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const response = ctx.switchToHttp().getResponse();

        // Obter o span atual e seu TraceID
        const currentSpan = trace.getSpan(context.active());
        if (currentSpan) {
          const spanContext = currentSpan.spanContext();
          const traceId = spanContext.traceId;

          // Adicionar o TraceID ao cabeçalho da resposta
          response.setHeader('X-Trace-ID', traceId);
        }
      }),
    );
  }
}
