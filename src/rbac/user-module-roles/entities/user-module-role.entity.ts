import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../../../users/entities/user.entity';
import { BusinessModuleEntity } from '../../modules/entities/business-module.entity';
import { RoleEntity } from '../../roles/entities/role.entity';

@Entity({ name: 'user_module_roles' })
@Unique('UQ_user_module_role', ['user', 'module', 'role'])
export class UserModuleRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  @ManyToOne(() => BusinessModuleEntity, { eager: true })
  module: BusinessModuleEntity;

  @ManyToOne(() => RoleEntity, { eager: true })
  role: RoleEntity;

  // ✅ per-action permissions
  @Column({ default: true })
  canRead: boolean;

  @Column({ default: false })
  canCreate: boolean;

  @Column({ default: false })
  canUpdate: boolean;

  @Column({ default: false })
  canDelete: boolean;
}
