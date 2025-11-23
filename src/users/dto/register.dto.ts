import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Company name where the employee works',
    example: 'ABC',
    required: true,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Employee number or ID within the company',
    example: '1234567',
    required: true,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  employeeNumber: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'User@123',
    required: true,
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
