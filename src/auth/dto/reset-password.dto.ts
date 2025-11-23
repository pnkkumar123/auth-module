import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received from forgot-password endpoint',
    example: 'a1b2c3d4e5f6...',
    required: true,
    minLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePassword@123',
    required: true,
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'Company name where the user is employed',
    example: 'ABC',
    required: true,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Employee number/ID within the company',
    example: '1234567',
    required: true,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  employeeNumber: string;
}