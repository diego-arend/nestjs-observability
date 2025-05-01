import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import initTracing from './tracing';

// Inicializa o tracing antes de qualquer coisa
initTracing();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplicando o interceptor de métricas globalmente
  const metricsInterceptor = app.get(MetricsInterceptor);
  app.useGlobalInterceptors(metricsInterceptor);

  await app.listen(process.env.PORT || 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
