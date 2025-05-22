import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva Atualizado',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva.atualizado@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser um endereço de email válido' })
  email?: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senhaAtualizada123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  password?: string;
}
