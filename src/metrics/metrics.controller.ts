import { Controller, UseGuards, Get } from '@nestjs/common';
import { MetricsAuthGuard } from './guards/metrics-auth.guard';
import { Public } from '../modules/auth/decorators/public.decorator';

@Controller()
export class MetricsController {
  @Public() // Marca como público para ignorar o JwtAuthGuard
  @UseGuards(MetricsAuthGuard) // Usa apenas o MetricsAuthGuard para este endpoint
  @Get('metrics')
  getMetrics() {
    // Este método será interceptado pelo PrometheusModule
    // que responderá com as métricas
    return;
  }
}
