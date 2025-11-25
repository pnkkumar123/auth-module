import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Obra } from '../entities/obra.entity';
import { CreateObraDto } from '../dto/create-obra.dto';
import { SearchObrasDto } from '../dto/search-obras.dto';

@Injectable()
export class ObrasService {
  constructor(
    @InjectRepository(Obra)
    private readonly obraRepository: Repository<Obra>,
  ) {}

  async create(createObraDto: CreateObraDto): Promise<Obra> {
    return {} as Obra;
  }

  async findAll(searchObrasDto: SearchObrasDto): Promise<Obra[]> {
    return [];
  }

  async findOne(id: string): Promise<Obra> {
    return {} as Obra;
  }

  async update(id: string, createObraDto: CreateObraDto): Promise<Obra> {
    return {} as Obra;
  }

  async remove(id: string): Promise<void> {
    return Promise.resolve();
  }
}