import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';

// ✅ Only these imports now
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { ModuleAccess } from '../common/decorators/module-access.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Register New User',
    description: 'Register a new user with company, employee number, and password. Employee must exist in "pe" table with empresa + nfunc.'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 2 },
        companyName: { type: 'string', example: 'ABC' },
        employeeNumber: { type: 'string', example: '1234567' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Employee not found in company records (pe table)' })
  @ApiResponse({ status: 409, description: 'User already registered with these credentials' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieve all users in the system. Requires HR module read permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          companyName: { type: 'string', example: 'SYSTEM' },
          employeeNumber: { type: 'string', example: '0001' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  // ✅ Protect with module-based permission
  @UseGuards(JwtAuthGuard, ModuleAccessGuard)
  @ModuleAccess('HR', 'read') // 👈 change module/action as needed
  @Get('all')
  async findAll() {
    return this.usersService.findAll();
  }
}
