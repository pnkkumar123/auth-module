import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CreateEquipamentoDto } from '../dto/create-equipamento.dto';
import { SearchEquipamentosDto } from '../dto/search-equipamentos.dto';

@Controller('mdo/equipamentos')
export class EquipamentosController {
  @Post()
  create(@Body() createEquipamentoDto: CreateEquipamentoDto) {
    return;
  }

  @Get()
  findAll(@Query() searchEquipamentosDto: SearchEquipamentosDto) {
    return;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() createEquipamentoDto: CreateEquipamentoDto) {
    return;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return;
  }
}