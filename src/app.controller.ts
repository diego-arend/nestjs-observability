import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggerService } from './logger/logger.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly logger: LoggerService) {}

  @Get('health')
  healthCheck() {
    this.logger.debug('Health check realizado', 'AppController');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
