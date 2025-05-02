import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Configuração do TypeORM usando ConfigService
 * @param configService - Serviço de configuração do NestJS
 * @returns Configuração do TypeORM
 */
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: parseInt(configService.get('POSTGRES_PORT'), 10) || 5432,
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    autoLoadEntities: true,
    synchronize: configService.get('NODE_ENV') !== 'production',
    logging:
      configService.get('NODE_ENV') !== 'production'
        ? ['error', 'warn']
        : false,
    logger: 'advanced-console',
    ssl: configService.get('NODE_ENV') === 'production',
  };
};

/**
 * Criação do DataSource para migrations e comandos CLI
 * Utilizado pelo CLI do TypeORM para gerenciamento de migrations
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
  ssl: process.env.NODE_ENV === 'production',
} as DataSourceOptions);
