import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipamento } from '../entities/equipamento.entity';
import { CreateEquipamentoDto } from '../dto/create-equipamento.dto';
import { SearchEquipamentosDto } from '../dto/search-equipamentos.dto';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private readonly equipamentoRepository: Repository<Equipamento>,
  ) {}

  async create(createEquipamentoDto: CreateEquipamentoDto): Promise<Equipamento> {
    return {} as Equipamento;
  }

  async findAll(searchEquipamentosDto: SearchEquipamentosDto): Promise<Equipamento[]> {
    return [];
  }

  async findOne(id: string): Promise<Equipamento> {
    return {} as Equipamento;
  }

  async update(id: string, createEquipamentoDto: CreateEquipamentoDto): Promise<Equipamento> {
    return {} as Equipamento;
  }

  async remove(id: string): Promise<void> {
    return Promise.resolve();
  }
}