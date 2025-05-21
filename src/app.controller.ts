import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLoggerService } from './logger/pino-logger.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly logger: PinoLoggerService) {}

  @Get('health')
  healthCheck() {
    this.logger.debug('Health check realizado', 'AppController');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
