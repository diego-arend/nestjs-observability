import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '../../exceptions/custom-exceptions';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Verificar se já existe usuário com este email
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Usuário', 'email', createUserDto.email);
      }

      // Se não existir, criar o novo usuário
      const user = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      // Tratamento específico para violação de constraint unique
      if (error.code === '23505') {
        // Código do PostgreSQL para unique violation
        throw new ConflictException('Usuário', 'email', createUserDto.email);
      }

      // Se for um erro já tratado, repassar
      if (error instanceof ConflictException) {
        throw error;
      }

      // Tratamento genérico para outros erros
      this.logger.error(`Erro ao criar usuário: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      this.logger.error(
        `Erro ao buscar todos os usuários: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao buscar usuários');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuário', id);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar usuário com ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erro ao buscar usuário com ID ${id}`,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Verificar se o usuário existe
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuário', id);
      }

      // Se estiver atualizando o email, verificar se já não existe
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingUser) {
          throw new ConflictException('Usuário', 'email', updateUserDto.email);
        }
      }

      // Atualizar os dados do usuário
      const updatedUser = this.usersRepository.merge(user, updateUserDto);
      return await this.usersRepository.save(updatedUser);
    } catch (error) {
      // Tratamento específico para violação de constraint unique
      if (error.code === '23505') {
        // Código do PostgreSQL para unique violation
        throw new ConflictException(
          'Usuário',
          'email',
          updateUserDto.email || 'desconhecido',
        );
      }

      // Se for um erro já tratado, repassar
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Tratamento genérico para outros erros
      this.logger.error(
        `Erro ao atualizar usuário com ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erro ao atualizar usuário com ID ${id}`,
      );
    }
  }
}
