import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import initTracing from './tracing';
import { ValidationPipe, Logger } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Inicializa o tracing antes de qualquer coisa
initTracing();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Database');

  // Aplicando o interceptor de métricas globalmente
  const metricsInterceptor = app.get(MetricsInterceptor);
  app.useGlobalInterceptors(metricsInterceptor);

  app.useGlobalPipes(new ValidationPipe());

  // Verificar status das migrações
  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());

    // Verificar se as migrações foram executadas corretamente
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      logger.warn('Existem migrações pendentes. Executando agora...');
      await dataSource.runMigrations();
      logger.log('Migrações executadas com sucesso!');
    } else {
      logger.log('Banco de dados atualizado. Todas as migrações foram aplicadas.');
    }
  } catch (error) {
    logger.error(`Erro ao verificar/executar migrações: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      // Em produção, falhar se as migrações não puderem ser verificadas
      process.exit(1);
    }
  }

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Observability API')
    .setDescription(
      'API com monitoramento completo: Prometheus, Grafana e Tempo',
    )
    .setVersion('1.0')
    .addTag('metrics', 'Endpoints relacionados a métricas e observabilidade')
    .addTag('users', 'Operações de usuários')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
