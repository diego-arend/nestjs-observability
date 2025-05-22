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
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Método privado para hashear a senha
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT'));
    return bcrypt.hash(password, saltRounds);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Verificar se já existe usuário com este email
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Usuário', 'email', createUserDto.email);
      }

      // Hash da senha antes de salvar
      const hashedPassword = await this.hashPassword(createUserDto.password);

      // Se não existir, criar o novo usuário com senha hasheada
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(user);

      // Retornar o usuário criado sem a senha
      const { ...result } = savedUser;
      return result;
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
      // Retorna todos os usuários, mas sem a senha
      const users = await this.usersRepository.find();
      // Usando _ para indicar descartamos intencionalmente a propriedade password
      return users.map(({ ...userData }) => userData);
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

      // Retorna o usuário sem a senha, usando _ para indicar que descartamos a propriedade
      const { ...userData } = user;
      return userData;
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

      // Preparar os dados para atualização
      const updateData = { ...updateUserDto };

      // Se estiver atualizando a senha, hashear antes de salvar
      if (updateData.password) {
        updateData.password = await this.hashPassword(updateData.password);
      }

      // Atualizar os dados do usuário
      const updatedUser = this.usersRepository.merge(user, updateData);
      const savedUser = await this.usersRepository.save(updatedUser);

      // Retornar usuário sem a senha
      const { ...userData } = savedUser;
      return userData;
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

  /**
   * Remove um usuário do sistema
   * @param id ID do usuário a ser removido
   */
  async remove(id: number): Promise<void> {
    try {
      // Verificar se o usuário existe
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuário', id);
      }

      // Remover o usuário
      await this.usersRepository.remove(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Erro ao remover usuário com ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erro ao remover usuário com ID ${id}`,
      );
    }
  }

  /**
   * Método adicional para validar credenciais do usuário (login)
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      // Renomeamos para _ para indicar explicitamente que estamos descartando o campo
      const { ...userData } = user;
      return userData;
    } catch (error) {
      this.logger.error(
        `Erro ao validar credenciais: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao validar credenciais');
    }
  }
}
