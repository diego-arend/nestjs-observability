import { Controller, UseGuards, Get, Res, Logger } from '@nestjs/common';
import { MetricsAuthGuard } from './guards/metrics-auth.guard';
import { Public } from '../modules/auth/decorators/public.decorator';
import { Response } from 'express';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, register } from 'prom-client';

@Controller()
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestsCounter: Counter<string>,
  ) {}

  @Public() // Marca como público para ignorar o JwtAuthGuard
  @UseGuards(MetricsAuthGuard) // Usa apenas o MetricsAuthGuard para este endpoint
  @Get('metrics')
  async getMetrics(@Res() response: Response) {
    this.logger.log('Endpoint /metrics acessado com autenticação válida');
    try {
      // Obter todas as métricas registradas
      const metrics = await register.metrics();

      // Definir o tipo de conteúdo correto para o Prometheus
      response.setHeader('Content-Type', register.contentType);

      // Retornar as métricas
      return response.send(metrics);
    } catch (error) {
      this.logger.error(
        `Erro ao gerar métricas: ${error.message}`,
        error.stack,
      );
      response.status(500).send(`Erro ao gerar métricas: ${error.message}`);
    }
  }
}
