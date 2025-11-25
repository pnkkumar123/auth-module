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
import { DetailsService } from '../services/details.service';
import { CreateDetailDto } from '../dto/create-detail.dto';
import { UpdateDetailDto } from '../dto/update-detail.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 

@Controller('mdo/details')
@UseGuards(JwtAuthGuard, RolesGuard) // ensure logged in + role logic
export class DetailsController {
  constructor(private readonly detailsService: DetailsService) {}

  /**
   * Create detail row
   * Requirements:
   * - user must have access to parent header
   * - enforce creation-day rule inside service
   */
  @Post()
  async create(@Body() dto: CreateDetailDto, @Req() req) {
    return this.detailsService.create(dto, req.user);
  }

  /**
   * Get detail by bistamp
   * Must enforce:
   * - user must own the parent header or be supervisor
   */
  @Get(':bistamp')
  async findOne(@Param('bistamp') bistamp: string, @Req() req) {
    return this.detailsService.findOne(bistamp, req.user);
  }

  /**
   * Find all details for a specific header (bostamp)
   * Must enforce:
   * - user can only access OWN header unless supervisor
   */
  @Get('header/:bostamp')
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
  async remove(@Param('bistamp') bistamp: string, @Req() req) {
    return this.detailsService.remove(bistamp, req.user);
  }
}
