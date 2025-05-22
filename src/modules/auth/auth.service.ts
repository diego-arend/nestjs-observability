import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Validar as credenciais usando o serviço de usuários
    const user = await this.usersService.validateCredentials(email, password);

    if (!user) {
      this.logger.warn(`Tentativa de login falhou para o email: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    const expiresInSeconds = this.getExpiresInSeconds(expiresIn);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: ['user'], // Você pode implementar roles no futuro
    };

    const token = this.jwtService.sign(payload, {
      expiresIn,
    });

    this.logger.log(`Usuário autenticado com sucesso: ${email}`);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      user_id: user.id,
    };
  }

  /**
   * Converte string de expiração para segundos (ex: '1h' -> 3600)
   */
  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) return 3600; // padrão: 1 hora

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600;
    }
  }

  /**
   * Verifica se o token é válido
   */
  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
