import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { LoggerService } from './logger/logger.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('metrics')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectMetric('http_requests_total')
    private readonly counter: Counter<string>,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint principal da API' })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma mensagem de boas-vindas',
  })
  getHello(): string {
    this.counter.inc({ method: 'GET', path: '/', statusCode: '200' });
    this.logger.log('Endpoint getHello called', 'AppController');
    return this.appService.getHello();
  }

  @Get('error-demo')
  @ApiOperation({
    summary: 'Simular erro',
    description:
      'Endpoint que simula e registra erros para demonstração de métricas',
  })
  @ApiResponse({ status: 500, description: 'Erro simulado' })
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
  @ApiOperation({
    summary: 'Registrar evento personalizado',
    description:
      'Endpoint que registra eventos personalizados para demonstração de métricas',
  })
  @ApiResponse({ status: 200, description: 'Evento registrado com sucesso' })
  triggerEvent(): string {
    this.logger.recordEvent('custom_business_event', 'success');
    return 'Event recorded';
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('simulate-latency')
  simulateSlowQuery() {
    return this.usersService.findAllWithDelay(700); // 700ms de delay
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
