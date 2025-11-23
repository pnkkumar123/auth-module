import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Company name where the employee works',
    example: 'SYSTEM',
    required: true 
  })
  companyName: string;

  @ApiProperty({ 
    description: 'Employee number/ID within the company',
    example: '0001',
    required: true 
  })
  employeeNumber: string;

  @ApiProperty({ 
    description: 'User password',
    example: 'Admin@123',
    required: true 
  })
  password: string;
}