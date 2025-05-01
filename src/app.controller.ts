import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { LoggerService } from './logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectMetric('http_requests_total')
    private readonly counter: Counter<string>,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    // Corrigido: usar labels que correspondem aos definidos em metrics.providers.ts
    this.counter.inc({ method: 'GET', path: '/', statusCode: '200' });
    this.logger.log('Endpoint getHello called', 'AppController');
    return this.appService.getHello();
  }

  @Get('error-demo')
  triggerError(): string {
    try {
      // Simulando um erro
      throw new Error('Demo error');
    } catch (error) {
      this.logger.error(
        'Error in endpoint',
        error.stack,
        'AppController',
        'DemoError',
      );
      return 'Error logged and metrics recorded';
    }
  }

  @Get('event-demo')
  triggerEvent(): string {
    this.logger.recordEvent('custom_business_event', 'success');
    return 'Event recorded';
  }
}
