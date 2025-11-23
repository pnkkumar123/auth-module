import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserModuleRolesService } from '../../rbac/user-module-roles/user-module-roles.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userModuleRolesService: UserModuleRolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // ✅ from JWT strategy

    const userRoles = await this.userModuleRolesService.getRolesForUser(
      user.id,
    );

    const hasRole = requiredRoles.some(role =>
      userRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}