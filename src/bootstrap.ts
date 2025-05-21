import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { setupSwagger } from './swagger/swagger.config';
import { PinoLoggerService } from './logger/pino-logger.service';
import { EXCLUDED_PATHS } from './filters/filter-endpoints';
import { BadRequestException } from './exceptions/custom-exceptions';

export async function bootstrap() {
  // Criar uma instância do logger para o bootstrap
  const pinoLogger = new PinoLoggerService();
  const logger = pinoLogger.createChildLogger('Bootstrap');

  // Criar a aplicação com o logger personalizado
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Importante para garantir que os logs iniciais sejam processados pelo Pino
  });

  // Configurar o logger personalizado após a criação da aplicação
  app.useLogger(pinoLogger);

  // Obter a instância compartilhada do logger do container de injeção de dependências
  const sharedLogger = app.get(PinoLoggerService);

  // Aplicar globalmente o filtro de exceções personalizado
  app.useGlobalFilters(new HttpExceptionFilter(sharedLogger));

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
    logger.error(
      `Erro ao verificar/executar migrações: ${error.message}`,
      error.stack,
    );
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
