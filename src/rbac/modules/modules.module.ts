import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { BusinessModuleEntity } from './entities/business-module.entity';
import { UserModuleRolesModule } from '../user-module-roles/user-module-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessModuleEntity]),
    UserModuleRolesModule, // ✅ Import to access UserModuleRolesService
  ],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService, TypeOrmModule],
})
export class ModulesModule {}
