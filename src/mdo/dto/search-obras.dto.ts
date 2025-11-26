import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchObrasDto {
  @ApiPropertyOptional({
    description: 'Construction site code (obra)',
    example: 'OBRA-001',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  obra?: string;

  @ApiPropertyOptional({
    description: 'Construction site name/description',
    example: 'Construction Site Alpha',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nome?: string;

  @ApiPropertyOptional({
    description: 'Status/situation (must start with 3,4,5,7 for active sites)',
    example: '3-ACTIVE',
    maxLength: 10
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  situacao?: string;

  @ApiPropertyOptional({
    description: 'Search query string (matches obra or nome)',
    example: 'alpha',
    maxLength: 3000
  })
  @IsString()
  @IsOptional()
  @MaxLength(3000)
  query?: string;
}