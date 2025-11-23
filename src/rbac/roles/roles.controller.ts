import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({
    summary: 'Create New Role',
    description: 'Create a new role. Requires ADMIN role.'
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'MANAGER' },
        description: { type: 'string', example: 'Manager role with elevated permissions' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - ADMIN role required' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'MANAGER', description: 'Role name (must be unique)' },
        description: { type: 'string', example: 'Manager role with elevated permissions', description: 'Role description (optional)' }
      },
      required: ['name']
    }
  })
  @Post()
  @Roles('ADMIN')
  async create(@Body() createRoleDto: { name: string; description?: string }) {
    return this.rolesService.create(createRoleDto);
  }

  @ApiOperation({
    summary: 'Get All Roles',
    description: 'Retrieve all roles. Requires ADMIN role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'ADMIN' },
          description: { type: 'string', example: 'Administrator role' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - ADMIN role required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.rolesService.findAll();
  }

  @ApiOperation({
    summary: 'Get Role by ID',
    description: 'Retrieve a specific role by ID. Requires ADMIN role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'ADMIN' },
        description: { type: 'string', example: 'Administrator role' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Access denied - ADMIN role required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Update Role',
    description: 'Update an existing role. Requires ADMIN role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'MANAGER_UPDATED' },
        description: { type: 'string', example: 'Updated manager role description' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Access denied - ADMIN role required' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'MANAGER_UPDATED', description: 'Role name (optional)' },
        description: { type: 'string', example: 'Updated manager role description', description: 'Role description (optional)' }
      }
    }
  })
  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: { name?: string; description?: string },
  ) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @ApiOperation({
    summary: 'Delete Role',
    description: 'Delete a role by ID. Requires ADMIN role.'
  })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Access denied - ADMIN role required' })
  @ApiResponse({ status: 409, description: 'Cannot delete role with existing user assignments' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return { message: 'Role deleted successfully' };
  }
}
