import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class LoggerService {
  constructor(
    @InjectMetric('app_events_total')
    private readonly eventsCounter: Counter<string>,
    @InjectMetric('app_errors_total')
    private readonly errorsCounter: Counter<string>,
  ) {}

  log(message: string, context?: string): void {
    this.eventsCounter.inc({ event: context || 'general', status: 'success' });
    console.log(
      `[${new Date().toISOString()}] [${context || 'Application'}] ${message}`,
    );
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    errorType?: string,
  ): void {
    this.errorsCounter.inc({
      source: context || 'general',
      errorType: errorType || 'unknown',
    });
    console.error(
      `[${new Date().toISOString()}] [${context || 'Application'}] Error: ${message}`,
    );
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string): void {
    this.eventsCounter.inc({ event: context || 'general', status: 'warning' });
    console.warn(
      `[${new Date().toISOString()}] [${context || 'Application'}] Warning: ${message}`,
    );
  }

  debug(message: string, context?: string): void {
    console.debug(
      `[${new Date().toISOString()}] [${context || 'Application'}] Debug: ${message}`,
    );
  }

  recordEvent(
    event: string,
    status: 'success' | 'failure' | 'warning' = 'success',
  ): void {
    this.eventsCounter.inc({ event, status });
  }

  recordError(source: string, errorType: string): void {
    this.errorsCounter.inc({ source, errorType });
  }
}
