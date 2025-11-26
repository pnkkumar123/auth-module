import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ObrasService } from '../services/obras.service';
import { SearchObrasDto } from '../dto/search-obras.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { Obra } from '../entities/obra.entity';

@ApiTags('MDO - Autocomplete')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mdo/obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  /**
   * Autocomplete search for obras (construction sites)
   * Must apply Lucas rule:
   * Only show where situacao starts with 3, 4, 5, or 7
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Search obras (construction sites)',
    description: 'Autocomplete search for construction sites. Only returns active sites where situacao starts with 3, 4, 5, or 7.'
  })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    type: String,
    description: 'Search query (matches obra code or nome)',
    example: 'OBRA-001'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Obras found successfully',
    type: [Obra],
    content: {
      'application/json': {
        example: [
          {
            obra: 'OBRA-001',
            nome: 'Construction Site Alpha',
            situacao: '3-ACTIVE'
          },
          {
            obra: 'OBRA-002', 
            nome: 'Construction Site Beta',
            situacao: '4-IN-PROGRESS'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async search(@Query() query: SearchObrasDto) {
    return this.obrasService.searchObras(query);
  }

  /**
   * Get a single obra by code
   * Useful for validation when creating a header
   */
  @Get(':obra')
  @ApiOperation({ 
    summary: 'Get obra by code',
    description: 'Retrieves a single construction site by its obra code. Useful for validation.'
  })
  @ApiParam({ 
    name: 'obra', 
    description: 'Construction site code',
    example: 'OBRA-001',
    type: String
  })
  @ApiResponse({ 
    status: 200,
    description: 'Obra found successfully',
    type: Obra,
    content: {
      'application/json': {
        example: {
          obra: 'OBRA-001',
          nome: 'Construction Site Alpha',
          situacao: '3-ACTIVE'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Obra not found' })
  async findOne(@Param('obra') obra: string) {
    return this.obrasService.findOne(obra);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search obras by query',
    description: 'Simple search endpoint for obras autocomplete. Returns obra code and name for matching sites.'
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search query string',
    example: 'alpha'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [Obra],
    content: {
      'application/json': {
        example: [
          {
            obra: 'OBRA-001',
            nome: 'Construction Site Alpha',
            situacao: '3-ACTIVE'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  async searchObras(@Query('q') q: string) {
    return this.obrasService.search(q || '');
  }
}
