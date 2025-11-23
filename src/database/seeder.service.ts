import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../rbac/roles/entities/role.entity';
import { BusinessModuleEntity } from '../rbac/modules/entities/business-module.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EmployeeEntity } from '../employee/entities/employee.entity';
import { UserModuleRoleEntity } from '../rbac/user-module-roles/entities/user-module-role.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
    @InjectRepository(BusinessModuleEntity)
    private readonly modulesRepo: Repository<BusinessModuleEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeesRepo: Repository<EmployeeEntity>,
    @InjectRepository(UserModuleRoleEntity)
    private readonly userModuleRolesRepo: Repository<UserModuleRoleEntity>,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding...');
    
    await this.seedRoles();
    await this.seedModules();
    await this.seedAdminUser();
    
    this.logger.log('Database seeding completed');
  }

  private async seedRoles() {
    const existingRoles = await this.rolesRepo.count();
    
    if (existingRoles === 0) {
      this.logger.log('No roles found, seeding ADMIN role...');
      
      const adminRole = this.rolesRepo.create({
        name: 'ADMIN',
        description: 'System Administrator with full access',
      });
      
      await this.rolesRepo.save(adminRole);
      this.logger.log('ADMIN role created successfully');
    } else {
      this.logger.log('Roles already exist, skipping role seeding');
    }
  }

  private async seedModules() {
    const existingModules = await this.modulesRepo.count();
    
    if (existingModules === 0) {
      this.logger.log('No modules found, seeding default HR module...');
      
      const hrModule = this.modulesRepo.create({
        code: 'HR',
        name: 'Human Resources',
        description: 'Human Resources management module',
        isActive: true,
      });
      
      await this.modulesRepo.save(hrModule);
      this.logger.log('HR module created successfully');
    } else {
      this.logger.log('Modules already exist, skipping module seeding');
    }
  }

  private async seedAdminUser() {
    const existingAdmin = await this.usersRepo.findOne({
      where: { companyName: 'SYSTEM', employeeNumber: '0001' }
    });
    
    if (!existingAdmin) {
      this.logger.log('No admin user found, seeding system admin...');
      
      // Create employee first
      const employee = this.employeesRepo.create({
        companyName: 'SYSTEM',
        employeeNumber: '0001',
        fullName: 'System Administrator',
      });
      
      const savedEmployee = await this.employeesRepo.save(employee);
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const adminUser = this.usersRepo.create({
        companyName: 'SYSTEM',
        employeeNumber: '0001',
        passwordHash: hashedPassword,
        isActive: true,
      });
      
      const savedUser = await this.usersRepo.save(adminUser);
      
      // Assign ADMIN role to HR module
      const adminRole = await this.rolesRepo.findOne({ where: { name: 'ADMIN' } });
      const hrModule = await this.modulesRepo.findOne({ where: { code: 'HR' } });
      
      if (adminRole && hrModule) {
        const userModuleRole = this.userModuleRolesRepo.create({
          user: savedUser,
          module: hrModule,
          role: adminRole,
          canRead: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
        });
        
        await this.userModuleRolesRepo.save(userModuleRole);
        this.logger.log('Admin user created and assigned ADMIN role to HR module');
      }
    } else {
      this.logger.log('Admin user already exists, skipping admin user seeding');
    }
  }
}