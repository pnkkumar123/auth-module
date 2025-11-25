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
import { HeadersService } from '../services/headers.service';
import { CreateHeaderDto } from '../dto/create-header.dto';
import { UpdateHeaderDto } from '../dto/update-header.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('mdo/headers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HeadersController {
  constructor(private readonly headersService: HeadersService) {}

  /**
   * Create header
   */
  @Post()
  async create(@Body() dto: CreateHeaderDto, @Req() req) {
    return this.headersService.create(dto, req.user);
  }

  /**
   * Get paginated headers
   */
  @Get()
  async findAll(@Req() req, @Query('page') page: number = 1) {
    return this.headersService.findAll(page, req.user);
  }

  /**
   * Get single header (with access control)
   */
  @Get(':bostamp')
  async findOne(@Param('bostamp') bostamp: string, @Req() req) {
    return this.headersService.findOne(bostamp, req.user);
  }

  /**
   * Get full MDO sheet (header + details)
   */
  @Get(':bostamp/full')
  async getFullMdoSheet(@Param('bostamp') bostamp: string, @Req() req) {
    return this.headersService.getFullMdoSheet(bostamp, req.user);
  }

  /**
   * Update header
   */
  @Put(':bostamp')
  async update(
    @Param('bostamp') bostamp: string,
    @Body() dto: UpdateHeaderDto,
    @Req() req,
  ) {
    return this.headersService.update(bostamp, dto, req.user);
  }

  /**
   * Delete header
   */
  @Delete(':bostamp')
  async remove(@Param('bostamp') bostamp: string, @Req() req) {
    return this.headersService.remove(bostamp, req.user);
  }
}
