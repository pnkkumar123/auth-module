import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessModuleEntity } from './entities/business-module.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(BusinessModuleEntity)
    private readonly modulesRepo: Repository<BusinessModuleEntity>,
  ) {}

  async create(createModuleDto: { code: string; name: string; description?: string }): Promise<BusinessModuleEntity> {
    const module = this.modulesRepo.create(createModuleDto);
    return this.modulesRepo.save(module);
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
    await this.modulesRepo.remove(module);
  }
}
