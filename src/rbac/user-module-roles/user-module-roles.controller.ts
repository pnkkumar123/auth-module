import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserModuleRolesService } from './user-module-roles.service';
import { AssignUserModuleRoleDto } from './dto/assign-user-module-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';

@Controller('user-module-roles')
export class UserModuleRolesController {
  constructor(
    private readonly userModuleRolesService: UserModuleRolesService,
  ) {}

  // ✅ Protected by JWT + RBAC permission system
  @UseGuards(JwtAuthGuard, ModuleAccessGuard)
  @Post('assign')
  async assign(@Body() dto: AssignUserModuleRoleDto) {
    return this.userModuleRolesService.assign(dto);
  }
}
