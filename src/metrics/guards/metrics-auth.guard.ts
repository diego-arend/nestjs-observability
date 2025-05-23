import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class MetricsAuthGuard implements CanActivate {
  private readonly logger = new Logger(MetricsAuthGuard.name);

  constructor(private configService: ConfigService) {
    // Verificar se as credenciais foram carregadas corretamente
    const username = this.configService.get<string>('METRICS_AUTH_USERNAME');

    this.logger.log(
      `MetricsAuthGuard inicializado. Username configurado: ${username ? 'SIM' : 'NÃO'}`,
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Obter credenciais do .env
    const expectedUsername = this.configService.get<string>(
      'METRICS_AUTH_USERNAME',
    );
    const expectedPassword = this.configService.get<string>(
      'METRICS_AUTH_PASSWORD',
    );

    if (!expectedUsername || !expectedPassword) {
      this.logger.error('Credenciais para metrics não configuradas no .env');
      throw new UnauthorizedException('Configuração de autenticação ausente');
    }

    // Verificar autenticação básica
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      this.logger.warn(
        'Tentativa de acesso ao /metrics sem autenticação básica',
      );
      throw new UnauthorizedException('Autenticação básica obrigatória');
    }

    try {
      // Decodificar Basic auth
      const encoded = authHeader.substring(6); // Remove 'Basic ' do início
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const [username, password] = decoded.split(':');

      // Verificar as credenciais
      if (username !== expectedUsername || password !== expectedPassword) {
        this.logger.warn(
          `Tentativa de acesso com credenciais inválidas: ${username}`,
        );
        throw new UnauthorizedException('Credenciais inválidas');
      }

      this.logger.log(`Acesso autenticado ao /metrics: ${username}`);
      return true;
    } catch (error) {
      this.logger.error('Erro ao processar autenticação', error);
      throw new UnauthorizedException('Erro na autenticação');
    }
  }
}
