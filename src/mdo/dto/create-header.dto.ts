import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHeaderDto {
  @ApiProperty({
    description: 'Date of the MDO operation (YYYY-MM-DD format)',
    example: '2024-01-15',
    type: String,
    format: 'date'
  })
  @IsDateString()
  @IsNotEmpty()
  data: Date;

  @ApiProperty({
    description: 'Construction site code (obra)',
    example: 'OBRA-001',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  obra: string;

  @ApiProperty({
    description: 'Team leader/foreman name (encarregado)',
    example: 'John Doe',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  encarregado: string;
}
