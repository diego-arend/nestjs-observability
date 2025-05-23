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

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = context
            .switchToHttp()
            .getResponse()
            .statusCode.toString();
          this.requestsCounter.inc({ method, path: url, statusCode });

          const duration = (Date.now() - start) / 1000;
          this.requestDuration.observe(
            { method, path: url, statusCode },
            duration,
          );
        },
        error: (err) => {
          const statusCode = err.status || '500';
          this.requestsCounter.inc({ method, path: url, statusCode });

          const duration = (Date.now() - start) / 1000;
          this.requestDuration.observe(
            { method, path: url, statusCode },
            duration,
          );
        },
      }),
    );
  }
}
