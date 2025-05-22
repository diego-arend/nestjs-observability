import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLoggerService } from './logger/pino-logger.service';
import { Public } from './modules/auth/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly logger: PinoLoggerService) {}

  @Public()
  @Get('health')
  healthCheck() {
    this.logger.debug('Health check realizado', 'AppController');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
