import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CreateObraDto } from '../dto/create-obra.dto';
import { SearchObrasDto } from '../dto/search-obras.dto';

@Controller('mdo/obras')
export class ObrasController {
  @Post()
  create(@Body() createObraDto: CreateObraDto) {
    return;
  }

  @Get()
  findAll(@Query() searchObrasDto: SearchObrasDto) {
    return;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() createObraDto: CreateObraDto) {
    return;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return;
  }
}