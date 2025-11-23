import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserModuleRolesService } from './user-module-roles.service';
import { AssignUserModuleRoleDto } from './dto/assign-user-module-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@ApiTags('user-module-roles')
@Controller('user-module-roles')
export class UserModuleRolesController {
  constructor(
    private readonly userModuleRolesService: UserModuleRolesService,
  ) {}

  @ApiOperation({
    summary: 'Assign Role to User',
    description: 'Assign a role to a user for a specific module with permissions. Requires HR module create permission.'
  })
  @ApiResponse({
    status: 201,
    description: 'Role assigned successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            companyName: { type: 'string', example: 'ABC' },
            employeeNumber: { type: 'string', example: '1234567' }
          }
        },
        module: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            code: { type: 'string', example: 'HR' },
            name: { type: 'string', example: 'Human Resources' }
          }
        },
        role: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'ADMIN' }
          }
        },
        canRead: { type: 'boolean', example: true },
        canCreate: { type: 'boolean', example: false },
        canUpdate: { type: 'boolean', example: false },
        canDelete: { type: 'boolean', example: false }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User, module, or role not found' })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: AssignUserModuleRoleDto })
  // ✅ Protected by JWT + RBAC permission system - only admins can assign roles
  @UseGuards(JwtAuthGuard, ModuleAccessGuard)
  @ModuleAccess('HR', 'create') // Only users with HR module create permission can assign roles
  @Post('assign')
  async assign(@Body() dto: AssignUserModuleRoleDto) {
    return this.userModuleRolesService.assign(dto);
  }
}
