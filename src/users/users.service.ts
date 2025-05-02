import { Injectable } from '@nestjs/common';
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

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
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
