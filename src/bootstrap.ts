import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EXCLUDED_PATHS } from './filters/filter-endpoints';
import { setupSwagger } from './swagger/swagger.config';
import { HttpExceptionFilter } from './filters/http-exception.filter';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Aplicar globalmente o filtro de exceções personalizado
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // Garantir que erros de validação sejam transformados em HttpExceptions
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints).join(', '),
        );
        return new BadRequestException({
          message: messages,
          error: 'Bad Request',
        });
      },
    }),
  );

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
      logger.log(
        'Banco de dados atualizado. Todas as migrações foram aplicadas.',
      );
    }
  } catch (error) {
    logger.error(`Erro ao verificar/executar migrações: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      // Em produção, falhar se as migrações não puderem ser verificadas
      process.exit(1);
    }
  }

  // Configuração do Swagger usando o módulo centralizado
  setupSwagger(app);

  await app.listen(process.env.PORT || 3001);
  logger.log(`Application is running on: ${await app.getUrl()}`);

  logger.log(
    `Monitoramento (métricas e traces) desativado para endpoints de manutenção: ${EXCLUDED_PATHS.join(
      ', ',
    )}`,
  );

  return app;
}
