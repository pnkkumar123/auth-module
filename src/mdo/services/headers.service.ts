import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapaDiarioObraHeader } from '../entities/header.entity';
import { CreateHeaderDto } from '../dto/create-header.dto';
import { UpdateHeaderDto } from '../dto/update-header.dto';

@Injectable()
export class HeadersService {
  constructor(
    @InjectRepository(MapaDiarioObraHeader)
    private readonly headerRepository: Repository<MapaDiarioObraHeader>,
  ) {}

  async create(createHeaderDto: CreateHeaderDto): Promise<MapaDiarioObraHeader> {
    return {} as MapaDiarioObraHeader;
  }

  async findAll(): Promise<MapaDiarioObraHeader[]> {
    return [];
  }

  async findOne(id: string): Promise<MapaDiarioObraHeader> {
    return {} as MapaDiarioObraHeader;
  }

  async update(id: string, updateHeaderDto: UpdateHeaderDto): Promise<MapaDiarioObraHeader> {
    return {} as MapaDiarioObraHeader;
  }

  async remove(id: string): Promise<void> {
    return Promise.resolve();
  }
}