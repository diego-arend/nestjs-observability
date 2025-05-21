import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Criando usuário com email: ${createUserDto.email}`);

    try {
      const result = await this.usersService.create(createUserDto);
      this.logger.log(`Usuário criado com sucesso: ID=${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao criar usuário: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  async findAll() {
    this.logger.log('Listando todos os usuários');

    try {
      const users = await this.usersService.findAll();
      this.logger.log(`Retornados ${users.length} usuários`);
      return users;
    } catch (error) {
      this.logger.error(
        `Erro ao listar usuários: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('simulate-latency')
  async simulateSlowQuery() {
    this.logger.log('Executando consulta com latência simulada (700ms)');

    try {
      const users = await this.usersService.findAllWithDelay(700);
      this.logger.log(
        `Consulta lenta concluída, retornados ${users.length} usuários`,
      );
      return users;
    } catch (error) {
      this.logger.error(
        `Erro na consulta lenta: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando usuário com ID: ${id}`);

    try {
      const user = await this.usersService.findOne(+id);

      if (!user) {
        this.logger.warn(`Usuário com ID ${id} não encontrado`);
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
      }

      this.logger.log(`Usuário ${id} encontrado: ${user.name}`);
      return user;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Erro ao buscar usuário ${id}: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }
}
