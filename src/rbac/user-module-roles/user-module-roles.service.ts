import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModuleRoleEntity } from './entities/user-module-role.entity';
import { AssignUserModuleRoleDto } from './dto/assign-user-module-role.dto';
import { UserEntity } from '../../users/entities/user.entity';
import { BusinessModuleEntity } from '../modules/entities/business-module.entity';
import { RoleEntity } from '../roles/entities/role.entity';

@Injectable()
export class UserModuleRolesService {
  constructor(
    @InjectRepository(UserModuleRoleEntity)
    private readonly umrRepo: Repository<UserModuleRoleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(BusinessModuleEntity)
    private readonly modulesRepo: Repository<BusinessModuleEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
  ) {}

  async assign(dto: AssignUserModuleRoleDto) {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const module = await this.modulesRepo.findOne({ where: { id: dto.moduleId } });
    if (!module) throw new NotFoundException('Module not found');

    const role = await this.rolesRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    let umr = await this.umrRepo.findOne({
      where: { user: { id: user.id }, module: { id: module.id } },
    });

    if (!umr) {
      umr = this.umrRepo.create({
        user,
        module,
        role,
      });
    } else {
      umr.role = role;
    }

    umr.canRead = dto.canRead ?? true;
    umr.canCreate = dto.canCreate ?? false;
    umr.canUpdate = dto.canUpdate ?? false;
    umr.canDelete = dto.canDelete ?? false;

    return this.umrRepo.save(umr);
  }

  async hasPermission(
    userId: number,
    moduleCode: string,
    action: 'read' | 'create' | 'update' | 'delete',
  ): Promise<boolean> {
    const umr = await this.umrRepo
      .createQueryBuilder('umr')
      .leftJoinAndSelect('umr.module', 'module')
      .leftJoinAndSelect('umr.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('module.code = :moduleCode', { moduleCode })
      .getOne();

    if (!umr) return false;

    switch (action) {
      case 'read':
        return umr.canRead;
      case 'create':
        return umr.canCreate;
      case 'update':
        return umr.canUpdate;
      case 'delete':
        return umr.canDelete;
      default:
        return false;
    }
  }

  async getRolesForUser(userId: number): Promise<string[]> {
    const userModuleRoles = await this.umrRepo
      .createQueryBuilder('umr')
      .leftJoinAndSelect('umr.role', 'role')
      .leftJoinAndSelect('umr.module', 'module')
      .where('umr.user.id = :userId', { userId })
      .getMany();

    // Return unique role names across all modules
    const roleNames = userModuleRoles.map(umr => umr.role.name);
    return [...new Set(roleNames)];
  }

}
