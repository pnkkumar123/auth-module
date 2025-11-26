import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateObraDto {
  @ApiProperty({
    description: 'Work/Project code',
    example: 'OB-001',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  obra: string;

  @ApiProperty({
    description: 'Work/Project designation/name',
    example: 'Construction Project Alpha',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({
    description: 'Status code (3,4,5,7 for active projects)',
    example: '3',
    maxLength: 10
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  situacao: string;
}