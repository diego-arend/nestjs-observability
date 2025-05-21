import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
