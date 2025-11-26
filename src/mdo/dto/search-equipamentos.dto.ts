import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchEquipamentosDto {
  @ApiPropertyOptional({
    description: 'Equipment code (codviat)',
    example: 'EQ-001',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  codviat?: string;

  @ApiPropertyOptional({
    description: 'Equipment designation/name',
    example: 'Excavator Model X',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  desig?: string;

  @ApiPropertyOptional({
    description: 'Active status (0 = active, 1 = inactive). Only active equipment (0) is returned in autocomplete.',
    example: 0,
    type: Number
  })
  @IsOptional()
  inactivo?: number;
}