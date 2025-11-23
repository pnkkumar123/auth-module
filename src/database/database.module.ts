import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { RoleEntity } from '../rbac/roles/entities/role.entity';
import { BusinessModuleEntity } from '../rbac/modules/entities/business-module.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EmployeeEntity } from '../employee/entities/employee.entity';
import { UserModuleRoleEntity } from '../rbac/user-module-roles/entities/user-module-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      BusinessModuleEntity,
      UserEntity,
      EmployeeEntity,
      UserModuleRoleEntity,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}