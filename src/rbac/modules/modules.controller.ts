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
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';

@ApiTags('modules')
@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @ApiOperation({
    summary: 'Create New Module',
    description: 'Create a new business module. Requires HR module create permission.'
  })
  @ApiResponse({
    status: 201,
    description: 'Module created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        code: { type: 'string', example: 'HR' },
        name: { type: 'string', example: 'Human Resources' },
        description: { type: 'string', example: 'Human Resources management module' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Module with this code already exists' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'HR', description: 'Unique module code' },
        name: { type: 'string', example: 'Human Resources', description: 'Module name' },
        description: { type: 'string', example: 'Human Resources management module', description: 'Module description (optional)' }
      },
      required: ['code', 'name']
    }
  })
  @Post()
  @UseGuards(ModuleAccessGuard)
  @ModuleAccess('HR', 'create')
  async create(@Body() createModuleDto: { code: string; name: string; description?: string }) {
    return this.modulesService.create(createModuleDto);
  }

  @ApiOperation({
    summary: 'Get All Modules',
    description: 'Retrieve all business modules. Requires HR module read permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Modules retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          code: { type: 'string', example: 'HR' },
          name: { type: 'string', example: 'Human Resources' },
          description: { type: 'string', example: 'Human Resources management module' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @Get()
  @UseGuards(ModuleAccessGuard)
  @ModuleAccess('HR', 'read')
  async findAll() {
    return this.modulesService.findAll();
  }

  @ApiOperation({
    summary: 'Get Module by ID',
    description: 'Retrieve a specific module by ID. Requires HR module read permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Module retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        code: { type: 'string', example: 'HR' },
        name: { type: 'string', example: 'Human Resources' },
        description: { type: 'string', example: 'Human Resources management module' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Module ID', example: 1 })
  @Get(':id')
  @UseGuards(ModuleAccessGuard)
  @ModuleAccess('HR', 'read')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Update Module',
    description: 'Update an existing module. Requires HR module update permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Module updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        code: { type: 'string', example: 'HR' },
        name: { type: 'string', example: 'Human Resources Updated' },
        description: { type: 'string', example: 'Updated description' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Module ID', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'HR', description: 'Module code (optional)' },
        name: { type: 'string', example: 'Human Resources Updated', description: 'Module name (optional)' },
        description: { type: 'string', example: 'Updated description', description: 'Module description (optional)' },
        isActive: { type: 'boolean', example: true, description: 'Module active status (optional)' }
      }
    }
  })
  @Put(':id')
  @UseGuards(ModuleAccessGuard)
  @ModuleAccess('HR', 'update')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: { code?: string; name?: string; description?: string; isActive?: boolean },
  ) {
    return this.modulesService.update(+id, updateModuleDto);
  }

  @ApiOperation({
    summary: 'Delete Module',
    description: 'Delete a module by ID. Requires HR module delete permission.'
  })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Cannot delete module with existing role assignments' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Module ID', example: 1 })
  @Delete(':id')
  @UseGuards(ModuleAccessGuard)
  @ModuleAccess('HR', 'delete')
  async remove(@Param('id') id: string) {
    await this.modulesService.remove(+id);
    return { message: 'Module deleted successfully' };
  }
}
