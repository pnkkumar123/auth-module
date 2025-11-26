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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { HeadersService } from '../services/headers.service';
import { CreateHeaderDto } from '../dto/create-header.dto';
import { UpdateHeaderDto } from '../dto/update-header.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MapaDiarioObraHeader } from '../entities/header.entity';

@ApiTags('MDO - Headers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mdo/headers')
export class HeadersController {
  constructor(private readonly headersService: HeadersService) {}

  /**
   * Create a new MDO header
   * Auto-generates bostamp (MDOAPPH- prefix) and sets createdAt
   */
  @Post()
  @ApiOperation({ 
    summary: 'Create MDO header',
    description: 'Creates a new Mapa Diário Obra header with auto-generated bostamp. Requires valid obra and encarregado.'
  })
  @ApiBody({ 
    type: CreateHeaderDto,
    description: 'Header creation data',
    examples: {
      valid: {
        value: {
          data: '2024-01-15',
          obra: 'OBRA-001',
          encarregado: 'John Doe'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Header created successfully',
    type: MapaDiarioObraHeader,
    content: {
      'application/json': {
        example: {
          bostamp: 'MDOAPPH-20240115-001',
          userid: 123,
          data: '2024-01-15',
          obra: 'OBRA-001',
          encarregado: 'John Doe',
          createdAt: '2024-01-15T10:30:00.000Z',
          companyName: 'ABC',
          employeeNumber: '1234567'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error - missing required fields or invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Obra not found' })
  async create(@Body() dto: CreateHeaderDto, @Req() req) {
    return this.headersService.create(dto, req.user);
  }

  /**
   * Get paginated list of MDO headers
   * Supports pagination with page parameter
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get paginated headers',
    description: 'Retrieves paginated list of MDO headers. Normal users see only their own records, supervisors see all.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Page number for pagination (default: 1)',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Headers retrieved successfully',
    content: {
      'application/json': {
        example: {
          page: 1,
          total: 25,
          totalPages: 3,
          items: [
            {
              bostamp: 'MDOAPPH-20240115-001',
              userid: 123,
              data: '2024-01-15',
              obra: 'OBRA-001',
              encarregado: 'John Doe',
              createdAt: '2024-01-15T10:30:00.000Z',
              companyName: 'ABC',
              employeeNumber: '1234567'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(@Req() req, @Query('page') page: number = 1) {
    return this.headersService.findAll(page, req.user);
  }

  /**
   * Get single header by bostamp
   * Includes access control - users can only access their own headers or where they are encarregado
   */
  @Get(':bostamp')
  @ApiOperation({ 
    summary: 'Get header by bostamp',
    description: 'Retrieves a single MDO header by its unique bostamp. Enforces access control rules.'
  })
  @ApiParam({ 
    name: 'bostamp', 
    description: 'Unique header identifier (GUID starting with MDOAPPH-)',
    example: 'MDOAPPH-20240115-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Header found successfully',
    type: MapaDiarioObraHeader,
    content: {
      'application/json': {
        example: {
          bostamp: 'MDOAPPH-20240115-001',
          userid: 123,
          data: '2024-01-15',
          obra: 'OBRA-001',
          encarregado: 'John Doe',
          createdAt: '2024-01-15T10:30:00.000Z',
          companyName: 'ABC',
          employeeNumber: '1234567'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied to this header' })
  @ApiResponse({ status: 404, description: 'Header not found' })
  async findOne(@Param('bostamp') bostamp: string, @Req() req) {
    return this.headersService.findOne(bostamp, req.user);
  }

  /**
   * Get full MDO sheet (header + all details)
   * Returns complete MDO record with all associated detail rows
   */
  @Get(':bostamp/full')
  @ApiOperation({ 
    summary: 'Get full MDO sheet',
    description: 'Retrieves complete MDO record including header and all associated detail rows. Useful for detail view.'
  })
  @ApiParam({ 
    name: 'bostamp', 
    description: 'Unique header identifier (GUID starting with MDOAPPH-)',
    example: 'MDOAPPH-20240115-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Full MDO sheet retrieved successfully',
    content: {
      'application/json': {
        example: {
          header: {
            bostamp: 'MDOAPPH-20240115-001',
            userid: 123,
            data: '2024-01-15',
            obra: 'OBRA-001',
            encarregado: 'John Doe',
            createdAt: '2024-01-15T10:30:00.000Z',
            companyName: 'ABC',
            employeeNumber: '1234567'
          },
          details: [
            {
              bistamp: 'MDOAPPD-20240115-001',
              bostamp: 'MDOAPPH-20240115-001',
              empresa: 'ABC',
              nfunc: '1234567',
              codviat: null,
              design: 'John Doe',
              qtt: 8
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied to this header' })
  @ApiResponse({ status: 404, description: 'Header not found' })
  async getFullMdoSheet(@Param('bostamp') bostamp: string, @Req() req) {
    return this.headersService.getFullMdoSheet(bostamp, req.user);
  }

  /**
   * Update header
   * Cannot update after creation date (creation-day lock) unless supervisor
   */
  @Put(':bostamp')
  @ApiOperation({ 
    summary: 'Update header',
    description: 'Updates an existing MDO header. Cannot update after creation date unless supervisor.'
  })
  @ApiParam({ 
    name: 'bostamp', 
    description: 'Unique header identifier (GUID starting with MDOAPPH-)',
    example: 'MDOAPPH-20240115-001',
    type: String
  })
  @ApiBody({ 
    type: UpdateHeaderDto,
    description: 'Header update data',
    examples: {
      valid: {
        value: {
          data: '2024-01-16',
          obra: 'OBRA-002',
          encarregado: 'Jane Doe'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Header updated successfully',
    type: MapaDiarioObraHeader,
    content: {
      'application/json': {
        example: {
          bostamp: 'MDOAPPH-20240115-001',
          userid: 123,
          data: '2024-01-16',
          obra: 'OBRA-002',
          encarregado: 'Jane Doe',
          createdAt: '2024-01-15T10:30:00.000Z',
          companyName: 'ABC',
          employeeNumber: '1234567'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error - invalid update data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - creation-day lock or access denied' })
  @ApiResponse({ status: 404, description: 'Header not found' })
  async update(
    @Param('bostamp') bostamp: string,
    @Body() dto: UpdateHeaderDto,
    @Req() req,
  ) {
    return this.headersService.update(bostamp, dto, req.user);
  }

  /**
   * Delete header
   * Cannot delete after creation date (creation-day lock) unless supervisor
   */
  @Delete(':bostamp')
  @ApiOperation({ 
    summary: 'Delete header',
    description: 'Deletes an MDO header and all its associated details. Cannot delete after creation date unless supervisor.'
  })
  @ApiParam({ 
    name: 'bostamp', 
    description: 'Unique header identifier (GUID starting with MDOAPPH-)',
    example: 'MDOAPPH-20240115-001',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Header deleted successfully',
    content: {
      'application/json': {
        example: {
          message: 'Header deleted successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - creation-day lock or access denied' })
  @ApiResponse({ status: 404, description: 'Header not found' })
  async remove(@Param('bostamp') bostamp: string, @Req() req) {
    return this.headersService.remove(bostamp, req.user);
  }
}
