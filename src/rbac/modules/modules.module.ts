import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { BusinessModuleEntity } from './entities/business-module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessModuleEntity])],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService, TypeOrmModule],
})
export class ModulesModule {}
