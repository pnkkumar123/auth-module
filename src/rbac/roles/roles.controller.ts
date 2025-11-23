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
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('ADMIN')
  async create(@Body() createRoleDto: { name: string; description?: string }) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: { name?: string; description?: string },
  ) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return { message: 'Role deleted successfully' };
  }
}
