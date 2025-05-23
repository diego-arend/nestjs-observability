import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { shouldSkipMonitoring } from '../filters/filter-endpoints';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestsCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.route?.path || req.url;

    // Normalizar o path - garantir que comece com barra e não tenha barra no final
    const normalizedPath = '/' + url.replace(/^\/|\/$/g, '');

    // Verificar se esse endpoint deve ser ignorado para métricas
    if (shouldSkipMonitoring(normalizedPath)) {
      return next.handle();
    }

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = context
            .switchToHttp()
            .getResponse()
            .statusCode.toString();
          this.requestsCounter.inc({
            method,
            path: normalizedPath,
            statusCode,
          });

          const duration = (Date.now() - start) / 1000;
          this.requestDuration.observe(
            { method, path: normalizedPath, statusCode },
            duration,
          );
        },
        error: (err) => {
          // Garantir que o statusCode seja uma string começando com 4 ou 5
          const statusCode = (err.status || err.statusCode || 500).toString();
          console.log(
            `Registrando erro com statusCode: ${statusCode}`,
            err.message,
          );

          this.requestsCounter.inc({
            method,
            path: normalizedPath,
            statusCode,
          });

          const duration = (Date.now() - start) / 1000;
          this.requestDuration.observe(
            { method, path: normalizedPath, statusCode },
            duration,
          );
        },
      }),
    );
  }
}
