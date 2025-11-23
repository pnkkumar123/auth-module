import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleEntity } from './entities/role.entity';
import { UserModuleRolesModule } from '../user-module-roles/user-module-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    UserModuleRolesModule, // ✅ Import to access UserModuleRolesService
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService, TypeOrmModule],
})
export class RolesModule {}
