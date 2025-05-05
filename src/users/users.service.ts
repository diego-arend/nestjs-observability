import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Verificar se já existe usuário com este email
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `Usuário com email ${createUserDto.email} já existe`,
        );
      }

      // Se não existir, criar o novo usuário
      const user = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      // Tratamento específico para violação de constraint unique
      if (error.code === '23505') {
        // Código do PostgreSQL para unique violation
        throw new ConflictException(
          `Usuário com email ${createUserDto.email} já existe`,
        );
      }

      // Se não for um erro de duplicidade, repassar o erro
      if (error instanceof ConflictException) {
        throw error;
      }

      // Tratamento genérico para outros erros
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findAllWithDelay(delayMs: number) {
    // Função para criar um delay usando promessas
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Aplicar o delay antes de executar a consulta
    await delay(delayMs);

    // Executar a consulta normal ao banco de dados
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }
}
