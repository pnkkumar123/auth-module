import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EquipamentosService } from '../services/equipamentos.service';
import { SearchEquipamentosDto } from '../dto/search-equipamentos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 


@Controller('mdo/equipamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  /**
   * Autocomplete search
   * Return only:
   * - inactivo = 0 (active)
   * - partial match on codviat or desig
   */
  @Get('search')
  async search(@Query() query: SearchEquipamentosDto) {
    return this.equipamentosService.searchEquipamentos(query);
  }

  /**
   * Get single equipment by code
   * Used when detail is equipment type
   * (Codviat entered manually → autofill desig)
   */
  @Get(':codviat')
  async findOne(@Param('codviat') codviat: string) {
    return this.equipamentosService.findOne(codviat);
  }

 @Get('search')
  async searchEquipamentos(@Query('q') q: string) {
    return this.equipamentosService.search(q || '');
  }

}
