import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapaDiarioObraDetail } from '../entities/detail.entity';
import { CreateDetailDto } from '../dto/create-detail.dto';
import { UpdateDetailDto } from '../dto/update-detail.dto';

@Injectable()
export class DetailsService {
  constructor(
    @InjectRepository(MapaDiarioObraDetail)
    private readonly detailRepository: Repository<MapaDiarioObraDetail>,
  ) {}

  async create(createDetailDto: CreateDetailDto): Promise<MapaDiarioObraDetail> {
    return {} as MapaDiarioObraDetail;
  }

  async findAll(): Promise<MapaDiarioObraDetail[]> {
    return [];
  }

  async findOne(id: string): Promise<MapaDiarioObraDetail> {
    return {} as MapaDiarioObraDetail;
  }

  async update(id: string, updateDetailDto: UpdateDetailDto): Promise<MapaDiarioObraDetail> {
    return {} as MapaDiarioObraDetail;
  }

  async remove(id: string): Promise<void> {
    return Promise.resolve();
  }
}