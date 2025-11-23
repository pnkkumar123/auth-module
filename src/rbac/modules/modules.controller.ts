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
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles('ADMIN')
  async create(@Body() createModuleDto: { code: string; name: string; description?: string }) {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(+id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: { code?: string; name?: string; description?: string; isActive?: boolean },
  ) {
    return this.modulesService.update(+id, updateModuleDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.modulesService.remove(+id);
    return { message: 'Module deleted successfully' };
  }
}
