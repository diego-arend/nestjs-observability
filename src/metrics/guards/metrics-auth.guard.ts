import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class MetricsAuthGuard implements CanActivate {
  private readonly logger = new Logger(MetricsAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const isDev = this.configService.get('NODE_ENV') === 'development';

    try {
      // Obter as credenciais configuradas
      const requiredUsername =
        this.configService.get<string>('METRICS_USERNAME');
      const requiredPassword =
        this.configService.get<string>('METRICS_PASSWORD');

      // Log de diagnóstico no ambiente de desenvolvimento
      if (isDev) {
        this.logger.debug(
          `Credenciais configuradas - Username: ${requiredUsername}`,
        );
        this.logger.debug(
          `Headers recebidos: ${JSON.stringify(request.headers)}`,
        );
      }

      // Se as credenciais não estiverem configuradas, não permitir acesso
      if (!requiredUsername || !requiredPassword) {
        this.logger.error('Credenciais de métricas não configuradas');
        throw new UnauthorizedException('Configuração de autenticação ausente');
      }

      // Obter o header Authorization da requisição
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        this.logger.warn('Tentativa de acesso às métricas sem credenciais');

        // Em ambiente de desenvolvimento, podemos ser mais tolerantes
        if (isDev) {
          this.logger.warn('Permitindo acesso em ambiente de desenvolvimento');
          return true;
        }

        throw new UnauthorizedException('Autenticação necessária');
      }

      // Verificar se é autenticação Basic
      if (!authHeader.startsWith('Basic ')) {
        this.logger.warn(
          `Tipo de autenticação inválido: ${authHeader.split(' ')[0]}`,
        );
        throw new UnauthorizedException('Tipo de autenticação inválido');
      }

      // Extrair e validar as credenciais (Base64)
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii',
      );
      const [username, password] = credentials.split(':');

      if (username !== requiredUsername || password !== requiredPassword) {
        this.logger.warn(
          `Acesso às métricas negado. Usuário recebido: ${username}`,
        );

        // Em ambiente de desenvolvimento, podemos ser mais tolerantes
        if (isDev) {
          this.logger.warn(
            'Permitindo acesso em ambiente de desenvolvimento mesmo com credenciais incorretas',
          );
          return true;
        }

        throw new UnauthorizedException('Credenciais inválidas');
      }

      this.logger.debug(`Acesso autorizado às métricas para: ${username}`);
      return true;
    } catch (error) {
      // Adicionar logs de diagnóstico em ambiente de desenvolvimento
      if (isDev) {
        this.logger.debug(`Erro detalhado: ${error.stack}`);
        // Permitir acesso no ambiente de desenvolvimento mesmo com erro
        return true;
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Erro ao validar acesso às métricas: ${error.message}`);
      return false;
    }
  }
}
