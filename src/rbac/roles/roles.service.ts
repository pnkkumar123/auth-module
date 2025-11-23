import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
  ) {}

  async create(createRoleDto: { name: string; description?: string }): Promise<RoleEntity> {
    try {
      const role = this.rolesRepo.create(createRoleDto);
      return await this.rolesRepo.save(role);
    } catch (error) {
      // Handle duplicate role name constraint violation
      if (error instanceof QueryFailedError) {
        const sqlError = error as any;
        if (sqlError.number === 2627 || sqlError.code === '23505' || sqlError.errno === 1062) {
          // SQL Server: 2627, PostgreSQL: 23505, MySQL: 1062
          throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
        }
      }
      throw error;
    }
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
    try {
      Object.assign(role, updateRoleDto);
      return await this.rolesRepo.save(role);
    } catch (error) {
      // Handle duplicate role name constraint violation
      if (error instanceof QueryFailedError) {
        const sqlError = error as any;
        if (sqlError.number === 2627 || sqlError.code === '23505' || sqlError.errno === 1062) {
          throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    try {
      await this.rolesRepo.remove(role);
    } catch (error) {
      // Handle foreign key constraint violation
      if (error instanceof QueryFailedError) {
        const sqlError = error as any;
        if (sqlError.number === 547 || sqlError.code === '23503' || sqlError.errno === 1451) {
          // SQL Server: 547, PostgreSQL: 23503, MySQL: 1451
          throw new ConflictException(`Cannot delete role with ID ${id} because it has existing user assignments. Please remove all user assignments for this role first.`);
        }
      }
      throw error;
    }
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.rolesRepo.findOne({ where: { name } });
  }
}
