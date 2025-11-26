import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
    try {
      const existingObra = await this.obraRepository.findOne({
        where: { obra: createObraDto.obra }
      });

      if (existingObra) {
        throw new BadRequestException(`Obra with code '${createObraDto.obra}' already exists`);
      }

      const obra = this.obraRepository.create(createObraDto);
      return await this.obraRepository.save(obra);

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create obra: ' + error.message);
    }
  }

  async findAll(searchObrasDto: SearchObrasDto): Promise<Obra[]> {
    try {
      const where: any = {};

      if (searchObrasDto.obra) {
        where.obra = Like(`%${searchObrasDto.obra}%`);
      }

      if (searchObrasDto.nome) {
        where.nome = Like(`%${searchObrasDto.nome}%`);
      }

      if (searchObrasDto.situacao) {
        where.situacao = searchObrasDto.situacao;
      }

      return await this.obraRepository.find({
        where,
        order: { obra: 'ASC' },
      });

    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch obras: ' + error.message);
    }
  }

  async findOne(obra: string): Promise<Obra> {
    try {
      const entity = await this.obraRepository.findOne({ where: { obra } });

      if (!entity) {
        throw new NotFoundException(`Obra with code '${obra}' not found`);
      }

      return entity;

    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch obra: ' + error.message);
    }
  }

  async update(obra: string, createObraDto: CreateObraDto): Promise<Obra> {
    try {
      await this.findOne(obra);

      await this.obraRepository.update(obra, createObraDto);
      return await this.findOne(obra);

    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update obra: ' + error.message);
    }
  }

  async remove(obra: string): Promise<void> {
    try {
      await this.findOne(obra);

      const result = await this.obraRepository.delete(obra);
      if (result.affected === 0) {
        throw new NotFoundException(`Obra with code '${obra}' not found`);
      }

    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete obra: ' + error.message);
    }
  }

  async searchObras(searchObrasDto: SearchObrasDto): Promise<Obra[]> {
    try {
      const query = searchObrasDto.query ?? '';

      return await this.obraRepository.find({
        where: [
          {
            obra: Like(`%${query}%`),
            situacao: Like('[3457]%'),
          },
          {
            nome: Like(`%${query}%`),
            situacao: Like('[3457]%'),
          }
        ],
        order: { obra: 'ASC' },
      });

    } catch (error) {
      throw new InternalServerErrorException('Failed to search obras: ' + error.message);
    }
  }

  async search(query: string) {
    const q = query ?? '';
    return this.obraRepository.find({
      where: [
        { situacao: Like('3%'), obra: Like(`%${q}%`) },
        { situacao: Like('4%'), obra: Like(`%${q}%`) },
        { situacao: Like('5%'), obra: Like(`%${q}%`) },
        { situacao: Like('7%'), obra: Like(`%${q}%`) },

        { situacao: Like('3%'), nome: Like(`%${q}%`) },
        { situacao: Like('4%'), nome: Like(`%${q}%`) },
        { situacao: Like('5%'), nome: Like(`%${q}%`) },
        { situacao: Like('7%'), nome: Like(`%${q}%`) },
      ],
      take: 10,
      order: { obra: 'ASC' },
    });
  }

}
