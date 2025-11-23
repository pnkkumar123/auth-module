import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  MODULE_ACCESS_KEY,
  ModuleAccessMeta,
} from '../decorators/module-access.decorator';
import { UserModuleRolesService } from '../../rbac/user-module-roles/user-module-roles.service';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private umrService: UserModuleRolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.getAllAndOverride<ModuleAccessMeta>(
      MODULE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!meta) return true; // no metadata → no restriction

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const allowed = await this.umrService.hasPermission(
      user.id,
      meta.moduleCode,
      meta.action,
    );

    if (!allowed) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
