import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'ID único do usuário' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Nome do usuário' })
  @Column()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email do usuário' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '2023-05-05T00:00:00Z',
    description: 'Data de criação',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-05T00:00:00Z',
    description: 'Data da última atualização',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
