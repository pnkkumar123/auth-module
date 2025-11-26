import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDetailDto {
  @ApiPropertyOptional({
    description: 'Parent header bostamp (foreign key)',
    example: 'MDOAPPH-20240115-001',
    maxLength: 30
  })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  bostamp?: string;

  @ApiPropertyOptional({
    description: 'Company name (for labor details)',
    example: 'ABC',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  empresa?: string;

  @ApiPropertyOptional({
    description: 'Employee number (for labor details)',
    example: '1234567',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nfunc?: string;

  @ApiPropertyOptional({
    description: 'Equipment code (for equipment details)',
    example: 'EQ-001',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  codviat?: string;

  @ApiPropertyOptional({
    description: 'Working hours (quantity)',
    example: 10,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  qtt?: number;
}