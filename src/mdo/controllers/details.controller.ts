import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateDetailDto } from '../dto/create-detail.dto';
import { UpdateDetailDto } from '../dto/update-detail.dto';

@Controller('mdo/details')
export class DetailsController {
  @Post()
  create(@Body() createDetailDto: CreateDetailDto) {
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
  update(@Param('id') id: string, @Body() updateDetailDto: UpdateDetailDto) {
    return;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return;
  }
}