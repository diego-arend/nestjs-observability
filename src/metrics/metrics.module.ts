import { Module, Global } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigModule } from '@nestjs/config';
import { MetricsController } from './metrics.controller';
import { metricsProviders } from './metrics.providers';
import { MetricsAuthGuard } from './guards/metrics-auth.guard';

@Global()
@Module({
  imports: [
    ConfigModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
  ],
  controllers: [MetricsController],
  providers: [...metricsProviders, MetricsAuthGuard],
  exports: [...metricsProviders, PrometheusModule],
})
export class MetricsModule {}
