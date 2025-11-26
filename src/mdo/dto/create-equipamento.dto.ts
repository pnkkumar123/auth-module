import { IsInt, IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipamentoDto {
  @ApiProperty({
    description: 'Equipment code (codviat)',
    example: 'EQ-001',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codviat: string;

  @ApiProperty({
    description: 'Equipment designation/name',
    example: 'Excavator Model X',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  desig: string;

  @ApiProperty({
    description: 'Active status (0 = active, 1 = inactive)',
    example: 0,
    default: 0
  })
  @IsInt()
  inactivo: number;
}