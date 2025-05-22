import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * Configuração do TypeORM usando ConfigService
 * @param configService - Serviço de configuração do NestJS
 * @returns Configuração do TypeORM
 */
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: parseInt(configService.get('POSTGRES_PORT'), 10),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    autoLoadEntities: true,
    synchronize: false, // Desabilitamos o synchronize para usar migrações
    migrationsRun: true, // Executa migrações automaticamente ao iniciar

    // Importante: apontar apenas para arquivos .js compilados
    migrations: [
      join(
        __dirname,
        '../../../infraestructure/database/postgres/migrations/**/*.js',
      ),
    ],
    migrationsTableName: 'migrations_history',

    // Configurações mais detalhadas de logging
    logging: isProduction
      ? ['error', 'warn', 'migration']
      : ['error', 'warn', 'migration', 'query'],
    logger: 'advanced-console',

    // Configurações de resiliência
    retryAttempts: 5,
    retryDelay: 3000,
  };
};

/**
 * DataSource para o CLI do TypeORM
 * Usado apenas para comandos de migração
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  // Para CLI: usar arquivos TypeScript
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/infraestructure/database/postgres/migrations/**/*.ts'],
  migrationsTableName: 'migrations_history',
});
