import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { DetailsService } from '../services/details.service';
import { CreateDetailDto } from '../dto/create-detail.dto';
import { UpdateDetailDto } from '../dto/update-detail.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { MapaDiarioObraDetail } from '../entities/detail.entity';

@ApiTags('MDO - Details')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // ensure logged in + role logic
@Controller('mdo/details')
export class DetailsController {
  constructor(private readonly detailsService: DetailsService) {}

  /**
   * Create detail row
   * Requirements:
   * - user must have access to parent header
   * - enforce creation-day rule inside service
   */
  @Post()
  @ApiOperation({ 
    summary: 'Create detail row',
    description: 'Creates a new detail row for an MDO header. Must be either labor (empresa+nfunc) OR equipment (codviat), never both.'
  })
  @ApiBody({ 
    type: CreateDetailDto,
    description: 'Detail creation data',
    examples: {
      labor: {
        value: {
          bostamp: 'MDOAPPH-20240115-001',
          empresa: 'ABC',
          nfunc: '1234567',
          qtt: 8
        },
        summary: 'Labor detail example'
      },
      equipment: {
        value: {
          bostamp: 'MDOAPPH-20240115-001',
          codviat: 'EQ-001',
          qtt: 4
        },
        summary: 'Equipment detail example'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Detail created successfully',
    type: MapaDiarioObraDetail,
    content: {
      'application/json': {
        example: {
          bistamp: 'MDOAPPD-20240115-001',
          bostamp: 'MDOAPPH-20240115-001',
          empresa: 'ABC',
          nfunc: '1234567',
          codviat: null,
          design: 'John Doe',
          qtt: 8
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error - mixing labor + equipment or missing required fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied to parent header or creation-day lock' })
  @ApiResponse({ status: 404, description: 'Parent header not found' })
  async create(@Body() dto: CreateDetailDto, @Req() req) {
    return this.detailsService.create(dto, req.user);
  }

  /**
   * Get detail by bistamp
   * Must enforce:
   * - user must own the parent header or be supervisor
   */
  @Get(':bistamp')
  @ApiOperation({ 
    summary: 'Get detail by bistamp',
    description: 'Retrieves a single detail row by its unique bistamp. Enforces access control to parent header.'
  })
  @ApiParam({ 
    name: 'bistamp', 
    description: 'Unique detail identifier (GUID starting with MDOAPPD-)',
    example: 'MDOAPPD-20240115-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detail found successfully',
    type: MapaDiarioObraDetail,
    content: {
      'application/json': {
        example: {
          bistamp: 'MDOAPPD-20240115-001',
          bostamp: 'MDOAPPH-20240115-001',
          empresa: 'ABC',
          nfunc: '1234567',
          codviat: null,
          design: 'John Doe',
          qtt: 8
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied to parent header' })
  @ApiResponse({ status: 404, description: 'Detail not found' })
  async findOne(@Param('bistamp') bistamp: string, @Req() req) {
    return this.detailsService.findOne(bistamp, req.user);
  }

  @Post(':bostamp/import')
  @ApiOperation({ 
    summary: 'Import details from previous date',
    description: 'Imports all detail rows from a previous date, resetting hours to zero. Useful for copying yesterday\'s work structure.'
  })
  @ApiParam({ 
    name: 'bostamp', 
    description: 'Target header bostamp where details will be imported',
    example: 'MDOAPPH-20240115-001',
    type: String
  })
  @ApiBody({ 
    description: 'Import configuration',
    schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date',
          description: 'Date to import from (YYYY-MM-DD format)',
          example: '2024-01-14'
        }
      },
      required: ['date']
    },
    examples: {
      yesterday: {
        value: {
          date: '2024-01-14'
        },
        summary: 'Import from yesterday'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Details imported successfully',
    content: {
      'application/json': {
        example: {
          importedCount: 3,
          message: 'Successfully imported 3 details from 2024-01-14'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid date format or no details found to import' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied to target header' })
  @ApiResponse({ status: 404, description: 'Target header not found or no details to import' })
  async importFromDate(
    @Param('bostamp') bostamp: string,
    @Body('date') date: string,
    @Req() req
  ) {
    return this.detailsService.importFromDate(bostamp, date, req.user);
  }

  /**
   * Find all details for a specific header (bostamp)
   * Must enforce:
   * - user can only access OWN header unless supervisor
   */
  @Get('header/:bostamp')
  @ApiOperation({ 
    summary: 'Get all details for header',
    description: 'Retrieves all detail rows associated with a specific header. Enforces access control to parent header.'
  })
  @ApiParam({ 
    name: 'bostamp', 
    description: 'Parent header bostamp (GUID starting with MDOAPPH-)',
    example: 'MDOAPPH-20240115-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Details retrieved successfully',
    type: [MapaDiarioObraDetail],
    content: {
      'application/json': {
        example: [
          {
            bistamp: 'MDOAPPD-20240115-001',
            bostamp: 'MDOAPPH-20240115-001',
            empresa: 'ABC',
            nfunc: '1234567',
            codviat: null,
            design: 'John Doe',
            qtt: 8
          },
          {
            bistamp: 'MDOAPPD-20240115-002',
            bostamp: 'MDOAPPH-20240115-001',
            empresa: null,
            nfunc: null,
            codviat: 'EQ-001',
            design: 'Excavator',
            qtt: 4
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied to parent header' })
  @ApiResponse({ status: 404, description: 'Header not found' })
  async findByHeader(
    @Param('bostamp') bostamp: string,
    @Req() req,
  ) {
    return this.detailsService.findByHeaderBostamp(bostamp, req.user);
  }

  /**
   * Update detail
   * Requirements:
   * - user must own header OR be supervisor
   * - cannot update after created date of header
   */
  @Put(':bistamp')
  @ApiOperation({ 
    summary: 'Update detail',
    description: 'Updates an existing detail row. Cannot update after creation date of parent header unless supervisor.'
  })
  @ApiParam({ 
    name: 'bistamp', 
    description: 'Unique detail identifier (GUID starting with MDOAPPD-)',
    example: 'MDOAPPD-20240115-001',
    type: String
  })
  @ApiBody({ 
    type: UpdateDetailDto,
    description: 'Detail update data',
    examples: {
      updateHours: {
        value: {
          qtt: 10
        },
        summary: 'Update working hours'
      },
      updateEquipment: {
        value: {
          codviat: 'EQ-002',
          qtt: 6
        },
        summary: 'Update equipment and hours'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detail updated successfully',
    type: MapaDiarioObraDetail,
    content: {
      'application/json': {
        example: {
          bistamp: 'MDOAPPD-20240115-001',
          bostamp: 'MDOAPPH-20240115-001',
          empresa: 'ABC',
          nfunc: '1234567',
          codviat: null,
          design: 'John Doe',
          qtt: 10
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error - invalid update data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - creation-day lock or access denied' })
  @ApiResponse({ status: 404, description: 'Detail not found' })
  async update(
    @Param('bistamp') bistamp: string,
    @Body() dto: UpdateDetailDto,
    @Req() req,
  ) {
    return this.detailsService.update(bistamp, dto, req.user);
  }

  /**
   * Delete detail
   * Requirements:
   * - user must own header OR be supervisor
   * - cannot delete after creation day
   */
  @Delete(':bistamp')
  @ApiOperation({ 
    summary: 'Delete detail',
    description: 'Deletes a detail row. Cannot delete after creation date of parent header unless supervisor.'
  })
  @ApiParam({ 
    name: 'bistamp', 
    description: 'Unique detail identifier (GUID starting with MDOAPPD-)',
    example: 'MDOAPPD-20240115-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detail deleted successfully',
    content: {
      'application/json': {
        example: {
          message: 'Detail deleted successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - creation-day lock or access denied' })
  @ApiResponse({ status: 404, description: 'Detail not found' })
  async remove(@Param('bistamp') bistamp: string, @Req() req) {
    return this.detailsService.remove(bistamp, req.user);
  }
}
