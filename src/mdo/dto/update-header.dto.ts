import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHeaderDto {
  @ApiPropertyOptional({
    description: 'Date of the MDO operation (YYYY-MM-DD format)',
    example: '2024-01-16',
    type: String,
    format: 'date'
  })
  @IsDateString()
  @IsOptional()
  data?: Date;

  @ApiPropertyOptional({
    description: 'Construction site code (obra)',
    example: 'OBRA-002',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  obra?: string;

  @ApiPropertyOptional({
    description: 'Team leader/foreman name (encarregado)',
    example: 'Jane Doe',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  encarregado?: string;
}
