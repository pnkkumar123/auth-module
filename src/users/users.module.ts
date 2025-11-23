import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmployeeModule } from '../employee/employee.module';
import { UserModuleRolesModule } from '../rbac/user-module-roles/user-module-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    EmployeeModule, // to check if employee exists on register
    UserModuleRolesModule, // ✅ Import to access UserModuleRolesService for guards
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // used by AuthService
})
export class UsersModule {}
