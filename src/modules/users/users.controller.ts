import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  USER_API_OPERATIONS,
  USER_API_PARAMS,
  USER_API_RESPONSES,
} from './documentation/users.document';
import { NotFoundException } from '../../exceptions/custom-exceptions';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation(USER_API_OPERATIONS.CREATE_USER)
  @ApiResponse(USER_API_RESPONSES.CREATE_SUCCESS)
  @ApiResponse(USER_API_RESPONSES.BAD_REQUEST)
  @ApiResponse(USER_API_RESPONSES.CONFLICT)
  @ApiResponse(USER_API_RESPONSES.INTERNAL_SERVER_ERROR)
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Criando usuário com email: ${createUserDto.email}`);
    const result = await this.usersService.create(createUserDto);
    this.logger.log(`Usuário criado com sucesso: ID=${result.id}`);
    return result;
  }

  @Get()
  @ApiOperation(USER_API_OPERATIONS.FIND_ALL)
  @ApiResponse(USER_API_RESPONSES.FIND_ALL_SUCCESS)
  @ApiResponse(USER_API_RESPONSES.INTERNAL_SERVER_ERROR)
  async findAll() {
    this.logger.log('Buscando todos os usuários');
    const users = await this.usersService.findAll();
    this.logger.log(`Retornados ${users.length} usuários`);
    return users;
  }

  @Get(':id')
  @ApiOperation(USER_API_OPERATIONS.FIND_ONE)
  @ApiParam(USER_API_PARAMS.ID)
  @ApiResponse(USER_API_RESPONSES.FIND_ONE_SUCCESS)
  @ApiResponse(USER_API_RESPONSES.NOT_FOUND)
  @ApiResponse(USER_API_RESPONSES.INTERNAL_SERVER_ERROR)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Buscando usuário com ID: ${id}`);
    const user = await this.usersService.findOne(id);

    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado`);
      throw new NotFoundException('Usuário', id);
    }

    this.logger.log(`Usuário ${id} encontrado: ${user.name}`);
    return user;
  }

  @Put(':id')
  @ApiOperation(USER_API_OPERATIONS.UPDATE_USER)
  @ApiParam(USER_API_PARAMS.ID)
  @ApiResponse(USER_API_RESPONSES.UPDATE_SUCCESS)
  @ApiResponse(USER_API_RESPONSES.BAD_REQUEST)
  @ApiResponse(USER_API_RESPONSES.NOT_FOUND)
  @ApiResponse(USER_API_RESPONSES.CONFLICT)
  @ApiResponse(USER_API_RESPONSES.INTERNAL_SERVER_ERROR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(`Atualizando usuário com ID: ${id}`);
    const result = await this.usersService.update(id, updateUserDto);
    this.logger.log(`Usuário ${id} atualizado com sucesso`);
    return result;
  }
}
