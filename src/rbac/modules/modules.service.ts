import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { BusinessModuleEntity } from './entities/business-module.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(BusinessModuleEntity)
    private readonly modulesRepo: Repository<BusinessModuleEntity>,
  ) {}

  async create(createModuleDto: { code: string; name: string; description?: string }): Promise<BusinessModuleEntity> {
    try {
      const module = this.modulesRepo.create(createModuleDto);
      return await this.modulesRepo.save(module);
    } catch (error) {
      // Handle duplicate module code constraint violation
      if (error instanceof QueryFailedError) {
        const sqlError = error as any;
        if (sqlError.number === 2627 || sqlError.code === '23505' || sqlError.errno === 1062) {
          // SQL Server: 2627, PostgreSQL: 23505, MySQL: 1062
          throw new ConflictException(`Module with code '${createModuleDto.code}' already exists`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<BusinessModuleEntity[]> {
    return this.modulesRepo.find();
  }

  async findOne(id: number): Promise<BusinessModuleEntity> {
    const module = await this.modulesRepo.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async findByCode(code: string): Promise<BusinessModuleEntity | null> {
    return this.modulesRepo.findOne({ where: { code } });
  }

  async update(id: number, updateModuleDto: { code?: string; name?: string; description?: string; isActive?: boolean }): Promise<BusinessModuleEntity> {
    const module = await this.findOne(id);
    Object.assign(module, updateModuleDto);
    return this.modulesRepo.save(module);
  }

  async remove(id: number): Promise<void> {
    const module = await this.findOne(id);
    try {
      await this.modulesRepo.remove(module);
    } catch (error) {
      // Handle foreign key constraint violation
      if (error instanceof QueryFailedError) {
        const sqlError = error as any;
        if (sqlError.number === 547 || sqlError.code === '23503' || sqlError.errno === 1451) {
          // SQL Server: 547, PostgreSQL: 23503, MySQL: 1451
          throw new ConflictException(`Cannot delete module with ID ${id} because it has existing role assignments. Please remove all role assignments for this module first.`);
        }
      }
      throw error;
    }
  }
}
