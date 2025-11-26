import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EquipamentosService } from '../services/equipamentos.service';
import { SearchEquipamentosDto } from '../dto/search-equipamentos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { Equipamento } from '../entities/equipamento.entity';

@ApiTags('MDO - Autocomplete')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mdo/equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  /**
   * Autocomplete search
   * Return only:
   * - inactivo = 0 (active)
   * - partial match on codviat or desig
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Search equipamentos (equipment)',
    description: 'Autocomplete search for construction equipment. Only returns active equipment where inactivo = 0.'
  })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    type: String,
    description: 'Search query (matches codviat or desig)',
    example: 'excavator'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment found successfully',
    type: [Equipamento],
    content: {
      'application/json': {
        example: [
          {
            codviat: 'EQ-001',
            desig: 'Excavator Model X',
            inactivo: 0
          },
          {
            codviat: 'EQ-002',
            desig: 'Excavator Model Y',
            inactivo: 0
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async search(@Query() query: SearchEquipamentosDto) {
    return this.equipamentosService.searchEquipamentos(query);
  }

  /**
   * Get single equipment by code
   * Used when detail is equipment type
   * (Codviat entered manually → autofill desig)
   */
  @Get(':codviat')
  @ApiOperation({ 
    summary: 'Get equipment by code',
    description: 'Retrieves a single equipment by its codviat code. Useful for validation and autofill functionality.'
  })
  @ApiParam({ 
    name: 'codviat', 
    description: 'Equipment code',
    example: 'EQ-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment found successfully',
    type: Equipamento,
    content: {
      'application/json': {
        example: {
          codviat: 'EQ-001',
          desig: 'Excavator Model X',
          inactivo: 0
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async findOne(@Param('codviat') codviat: string) {
    return this.equipamentosService.findOne(codviat);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search equipment by query',
    description: 'Simple search endpoint for equipment autocomplete. Returns equipment code and designation for matching items.'
  })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    type: String,
    description: 'Search query string',
    example: 'excavator'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results',
    type: [Equipamento],
    content: {
      'application/json': {
        example: [
          {
            codviat: 'EQ-001',
            desig: 'Excavator Model X',
            inactivo: 0
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  async searchEquipamentos(@Query('q') q: string) {
    return this.equipamentosService.search(q || '');
  }
}
