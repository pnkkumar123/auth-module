import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModuleRolesService } from './user-module-roles.service';
import { UserModuleRolesController } from './user-module-roles.controller';

import { UserModuleRoleEntity } from './entities/user-module-role.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { BusinessModuleEntity } from '../modules/entities/business-module.entity';
import { RoleEntity } from '../roles/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserModuleRoleEntity,
      UserEntity,
      BusinessModuleEntity,
      RoleEntity,
    ]),
  ],
  providers: [UserModuleRolesService],
  controllers: [UserModuleRolesController],
  exports: [UserModuleRolesService], // ✅ needed for guards
})
export class UserModuleRolesModule {}
