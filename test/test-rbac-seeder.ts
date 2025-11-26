import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../src/rbac/roles/entities/role.entity';
import { BusinessModuleEntity } from '../src/rbac/modules/entities/business-module.entity';
import { UserEntity } from '../src/users/entities/user.entity';
import { UserModuleRoleEntity } from '../src/rbac/user-module-roles/entities/user-module-role.entity';

/**
 * Test-only RBAC seeder for MDO module permissions
 * This is ONLY used in test environment, never in production
 */
@Injectable()
export class TestRbacSeeder {
  private readonly logger = new Logger(TestRbacSeeder.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
    @InjectRepository(BusinessModuleEntity)
    private readonly modulesRepo: Repository<BusinessModuleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(UserModuleRoleEntity)
    private readonly userModuleRolesRepo: Repository<UserModuleRoleEntity>,
  ) {}

  /**
   * Seed test-only MDO permissions
   * This creates test roles and assigns MDO permissions for testing
   */
  async seedTestMdoPermissions(): Promise<void> {
    this.logger.log('Seeding test-only MDO permissions...');

    // Create test roles
    const testUserRole = await this.createTestRole('test-user', 'Test User with MDO permissions');
    const testSupervisorRole = await this.createTestRole('test-supervisor', 'Test Supervisor with full MDO access');

    // Create MDO module
    const mdoModule = await this.createTestModule('MDO', 'Mapa Diário Obra', 'MDO - Daily Work Map module');

    // Get test users (created in test setup)
    const normalUser = await this.usersRepo.findOne({ 
      where: { companyName: 'ABC', employeeNumber: '1234567' } 
    });
    const supervisorUser = await this.usersRepo.findOne({ 
      where: { companyName: 'SYSTEM', employeeNumber: '0001' } 
    });

    if (!normalUser || !supervisorUser) {
      this.logger.warn('Test users not found, skipping MDO permission seeding');
      return;
    }

    // Assign permissions to test-user (normal user)
    await this.assignMdoPermissions(normalUser, mdoModule, testUserRole, {
      'mdo.headers.create': true,
      'mdo.headers.read': true,
      'mdo.headers.update': false,
      'mdo.headers.delete': false,
      'mdo.details.create': true,
      'mdo.details.read': true,
      'mdo.details.update': true,
      'mdo.details.delete': true,
      'mdo.import': true,
      'mdo.autocomplete.obras': true,
      'mdo.autocomplete.equipamentos': true,
    });

    // Assign all permissions to test-supervisor
    await this.assignMdoPermissions(supervisorUser, mdoModule, testSupervisorRole, {
      'mdo.headers.create': true,
      'mdo.headers.read': true,
      'mdo.headers.update': true,
      'mdo.headers.delete': true,
      'mdo.details.create': true,
      'mdo.details.read': true,
      'mdo.details.update': true,
      'mdo.details.delete': true,
      'mdo.import': true,
      'mdo.autocomplete.obras': true,
      'mdo.autocomplete.equipamentos': true,
    });

    this.logger.log('Test MDO permissions seeded successfully');
  }

  private async createTestRole(name: string, description: string): Promise<RoleEntity> {
    let role = await this.rolesRepo.findOne({ where: { name } });
    
    if (!role) {
      role = this.rolesRepo.create({
        name,
        description,
      });
      role = await this.rolesRepo.save(role);
      this.logger.log(`Created test role: ${name}`);
    }
    
    return role;
  }

  private async createTestModule(code: string, name: string, description: string): Promise<BusinessModuleEntity> {
    let module = await this.modulesRepo.findOne({ where: { code } });
    
    if (!module) {
      module = this.modulesRepo.create({
        code,
        name,
        description,
        isActive: true,
      });
      module = await this.modulesRepo.save(module);
      this.logger.log(`Created test module: ${code}`);
    }
    
    return module;
  }

  private async assignMdoPermissions(
    user: UserEntity,
    module: BusinessModuleEntity,
    role: RoleEntity,
    permissions: Record<string, boolean>
  ): Promise<void> {
    // Check if assignment already exists
    const existingAssignment = await this.userModuleRolesRepo.findOne({
      where: { user: { id: user.id }, module: { id: module.id }, role: { id: role.id } }
    });

    if (existingAssignment) {
      this.logger.log(`MDO permissions already assigned to user ${user.companyName}-${user.employeeNumber}`);
      return;
    }

    // Create the assignment with appropriate permissions based on the role
    const canCreate = permissions['mdo.headers.create'] || permissions['mdo.details.create'];
    const canRead = permissions['mdo.headers.read'] || permissions['mdo.details.read'];
    const canUpdate = permissions['mdo.headers.update'] || permissions['mdo.details.update'];
    const canDelete = permissions['mdo.headers.delete'] || permissions['mdo.details.delete'];

    const userModuleRole = this.userModuleRolesRepo.create({
      user,
      module,
      role,
      canRead,
      canCreate,
      canUpdate,
      canDelete,
    });

    await this.userModuleRolesRepo.save(userModuleRole);
    this.logger.log(`Assigned MDO permissions to user ${user.companyName}-${user.employeeNumber} with role ${role.name}`);
  }

  /**
   * Clean up test MDO permissions (optional, for test cleanup)
   */
  async cleanupTestMdoPermissions(): Promise<void> {
    this.logger.log('Cleaning up test MDO permissions...');

    // Remove test roles
    await this.rolesRepo.delete({ name: 'test-user' });
    await this.rolesRepo.delete({ name: 'test-supervisor' });

    // Remove test module
    await this.modulesRepo.delete({ code: 'MDO' });

    this.logger.log('Test MDO permissions cleaned up');
  }
}