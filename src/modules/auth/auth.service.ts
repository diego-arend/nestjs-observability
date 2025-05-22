import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

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
    return this.generateAuthResponse(user.id, user.email);
  }

  /**
   * Registra um novo usuário e retorna um token JWT válido
   */
  async signup(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    this.logger.log(
      `Tentativa de registro para o email: ${createUserDto.email}`,
    );

    // Usar o serviço de usuários para criar o novo usuário
    const newUser = await this.usersService.create(createUserDto);

    this.logger.log(`Usuário registrado com sucesso: ${createUserDto.email}`);

    // Gerar token JWT para o novo usuário
    return this.generateAuthResponse(newUser.id, newUser.email);
  }

  /**
   * Função auxiliar para gerar a resposta de autenticação padrão
   */
  private generateAuthResponse(userId: number, email: string): AuthResponseDto {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    const expiresInSeconds = this.getExpiresInSeconds(expiresIn);

    const payload = {
      sub: userId,
      email: email,
      roles: ['user'], // Perfil padrão para novos usuários
    };

    const token = this.jwtService.sign(payload, {
      expiresIn,
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      user_id: userId,
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
