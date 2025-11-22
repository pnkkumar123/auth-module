import { Module } from '@nestjs/common';
import { UserModuleRolesService } from './user-module-roles.service';
import { UserModuleRolesController } from './user-module-roles.controller';

@Module({
  providers: [UserModuleRolesService],
  controllers: [UserModuleRolesController]
})
export class UserModuleRolesModule {}
