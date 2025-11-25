import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateHeaderDto } from '../dto/create-header.dto';
import { UpdateHeaderDto } from '../dto/update-header.dto';

@Controller('mdo/headers')
export class HeadersController {
  @Post()
  create(@Body() createHeaderDto: CreateHeaderDto) {
    return;
  }

  @Get()
  findAll() {
    return;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateHeaderDto: UpdateHeaderDto) {
    return;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return;
  }
}