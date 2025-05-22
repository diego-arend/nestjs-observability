import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Tipo do token',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Data de expiração do token em timestamp',
    example: 1622548800,
  })
  expires_at: number;

  @ApiProperty({
    description: 'ID do usuário autenticado',
    example: 1,
  })
  user_id: number;
}
