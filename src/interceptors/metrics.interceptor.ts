import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Incrementa o contador de requisições HTTP
        this.requestCounter.inc({ method, path, statusCode });

        // Registra a duração da requisição
        this.requestDuration.observe({ method, path, statusCode }, duration);
      }),
      catchError((err) => {
        const statusCode = err.status || 500;

        // Incrementa o contador para requisições com erro
        this.requestCounter.inc({ method, path, statusCode });

        throw err;
      }),
    );
  }
}
