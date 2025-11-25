import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ObrasService } from '../services/obras.service';
import { SearchObrasDto } from '../dto/search-obras.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 


@Controller('mdo/obras')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  /**
   * Autocomplete search for obras (construction sites)
   * Must apply Lucas rule:
   * Only show where situacao starts with 3, 4, 5, or 7
   */
  @Get('search')
  async search(@Query() query: SearchObrasDto) {
    return this.obrasService.searchObras(query);
  }

  /**
   * Get a single obra by code
   * Useful for validation when creating a header
   */
  @Get(':obra')
  async findOne(@Param('obra') obra: string) {
    return this.obrasService.findOne(obra);
  }
}
