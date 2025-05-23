import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsAuthGuard } from './guards/metrics-auth.guard';
import { metricsProviders } from './metrics.providers';
import { MetricsInterceptor } from '../interceptors/metrics.interceptor';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'nestjs_',
        },
      },
      path: '/internal-metrics-disabled',
    }),
  ],
  controllers: [MetricsController],
  providers: [
    {
      provide: MetricsAuthGuard,
      useFactory: (configService: ConfigService) => {
        return new MetricsAuthGuard(configService);
      },
      inject: [ConfigService],
    },
    ...metricsProviders,
    MetricsInterceptor,
  ],
  exports: [MetricsInterceptor, ...metricsProviders],
})
export class MetricsModule {}
