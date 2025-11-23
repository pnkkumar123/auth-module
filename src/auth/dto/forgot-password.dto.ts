import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address associated with the user account',
    example: 'user@example.com',
    required: true,
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Company name where the user is employed',
    example: 'SYSTEM',
    required: true,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Employee number/ID within the company',
    example: '0001',
    required: true,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  employeeNumber: string;
}