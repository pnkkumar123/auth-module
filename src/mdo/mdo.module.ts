import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapaDiarioObraHeader } from './entities/header.entity';
import { MapaDiarioObraDetail } from './entities/detail.entity';
import { Obra } from './entities/obra.entity';
import { Equipamento } from './entities/equipamento.entity';
import { EmployeeEntity } from '../employee/entities/employee.entity';
import { EmployeeModule } from '../employee/employee.module';
import { UserModuleRolesModule } from '../rbac/user-module-roles/user-module-roles.module';
import { HeadersController } from './controllers/headers.controller';
import { DetailsController } from './controllers/details.controller';
import { ObrasController } from './controllers/obras.controller';
import { EquipamentosController } from './controllers/equipamentos.controller';
import { HeadersService } from './services/headers.service';
import { DetailsService } from './services/details.service';
import { ObrasService } from './services/obras.service';
import { EquipamentosService } from './services/equipamentos.service';

@Module({
  imports: [
    EmployeeModule,
    UserModuleRolesModule,
    TypeOrmModule.forFeature([
      MapaDiarioObraHeader,
      MapaDiarioObraDetail,
      Obra,
      Equipamento,
      EmployeeEntity,
    ]),
  ],
  controllers: [
    HeadersController,
    DetailsController,
    ObrasController,
    EquipamentosController,
  ],
  providers: [
    HeadersService,
    DetailsService,
    ObrasService,
    EquipamentosService,
  ],
  exports: [
    HeadersService,
    DetailsService,
    ObrasService,
    EquipamentosService,
  ],
})
export class MdoModule {}
