import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
  ) {}

  async create(createRoleDto: { name: string; description?: string }): Promise<RoleEntity> {
    const role = this.rolesRepo.create(createRoleDto);
    return this.rolesRepo.save(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    return this.rolesRepo.find();
  }

  async findOne(id: number): Promise<RoleEntity> {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: { name?: string; description?: string }): Promise<RoleEntity> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.rolesRepo.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepo.remove(role);
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.rolesRepo.findOne({ where: { name } });
  }
}
