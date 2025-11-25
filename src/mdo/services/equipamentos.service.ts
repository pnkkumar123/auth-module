import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Equipamento } from '../entities/equipamento.entity';
import { SearchEquipamentosDto } from '../dto/search-equipamentos.dto';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private readonly equipamentoRepository: Repository<Equipamento>,
  ) {}

  /**
   * Autocomplete search for equipment
   * Must only return equipment where inactivo = 0
   */
  async searchEquipamentos(query: SearchEquipamentosDto): Promise<Equipamento[]> {
    try {
      const where: any = { inactivo: 0 }; // only active equipment

      if (query.codviat) {
        where.codviat = Like(`%${query.codviat}%`);
      }

      if (query.desig) {
        where.desig = Like(`%${query.desig}%`);
      }

      return await this.equipamentoRepository.find({
        where,
        order: { codviat: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to search equipamentos: ' + error.message);
    }
  }

  /**
   * Get single equipment by codviat
   * Used for auto-fill designation when adding details
   */
  async findOne(codviat: string): Promise<Equipamento> {
    try {
      const equipamento = await this.equipamentoRepository.findOne({
        where: { codviat },
      });

      if (!equipamento) {
        throw new NotFoundException(`Equipamento '${codviat}' not found`);
      }

      return equipamento;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch equipamento: ' + error.message);
    }
  }
}
