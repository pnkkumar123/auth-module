import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { EmployeeModule } from '../src/employee/employee.module';
import { ModulesModule } from '../src/rbac/modules/modules.module';
import { RolesModule } from '../src/rbac/roles/roles.module';
import { UserModuleRolesModule } from '../src/rbac/user-module-roles/user-module-roles.module';
import { DatabaseModule } from '../src/database/database.module';
import { MdoModule } from '../src/mdo/mdo.module';
import { TestTokenGenerator } from './test-token-generator';
import { MdoTestSeedService } from './mdo/mdo-test-seed.service';

export interface TestTokens {
  adminToken: string;
  userToken: string;
  userId: number;
  userWithoutPermissionsToken: string;
  userWithoutPermissionsId: number;
}

export class TestSetup {
  private app: INestApplication;
  private tokens: TestTokens;
  private tokenGenerator: TestTokenGenerator;
  private mdoTestSeedService: MdoTestSeedService;

  async setupApp(): Promise<INestApplication> {
    // Set test environment variables
    process.env.SKIP_PE_VALIDATION = 'true';
    process.env.JWT_SECRET = 'test-secret-key';
    
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'mssql',
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 1433),
          username: process.env.DB_USERNAME || 'sa',
          password: process.env.DB_PASSWORD || 'Pankaj@2025Secure!',
          database: process.env.DB_NAME || 'app_db',
          autoLoadEntities: true,
          synchronize: true,
          options: {
            trustServerCertificate: true,
          },
          retryAttempts: 3,
          retryDelay: 1000,
        }),
        UsersModule,
        AuthModule,
        EmployeeModule,
        ModulesModule,
        RolesModule,
        UserModuleRolesModule,
        DatabaseModule,
        MdoModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    this.app = moduleRef.createNestApplication();
    this.app.useGlobalPipes(new ValidationPipe());
    
    await this.app.init();

    // Initialize test token generator
    this.tokenGenerator = new TestTokenGenerator();

    // Initialize MDO test seed service
    this.mdoTestSeedService = new MdoTestSeedService(
      this.app.get('ObraRepository'),
      this.app.get('EquipamentoRepository'),
      this.app.get('EmployeeEntityRepository')
    );

    return this.app;
  }

  async setupTestData(): Promise<TestTokens> {
    const app = this.app;
    
    // Seed MDO test data first (before creating tokens)
    await this.mdoTestSeedService.seedMdoTestData();

    // Get users for token generation
    const usersRepo = this.app.get('UserEntityRepository');
    const adminUser = await usersRepo.findOne({ where: { companyName: 'SYSTEM', employeeNumber: '0001' } });
    const normalUser = await usersRepo.findOne({ where: { companyName: 'ABC', employeeNumber: '1234567' } });
    const noPermUser = await usersRepo.findOne({ where: { companyName: 'XYZ', employeeNumber: '9999999' } });

    // Generate test tokens with MDO permissions
    const adminToken = this.tokenGenerator.generateToken(adminUser, 'admin');

    // Register normal user
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        companyName: 'ABC',
        employeeNumber: '1234567',
        password: 'User@123',
      });

    // Normal user token with MDO permissions
    const userToken = this.tokenGenerator.generateToken(normalUser, 'test-user');
    const userId = normalUser.id;

    // Register user without permissions
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        companyName: 'XYZ',
        employeeNumber: '9999999',
        password: 'NoPerm@123',
      });

    // User without MDO permissions
    const userWithoutPermissionsToken = this.tokenGenerator.generateToken(noPermUser, 'no-permissions');
    const userWithoutPermissionsId = noPermUser.id;

    this.tokens = {
      adminToken,
      userToken,
      userId,
      userWithoutPermissionsToken,
      userWithoutPermissionsId,
    };

    return this.tokens;
  }

  getApp(): INestApplication {
    return this.app;
  }

  getTokens(): TestTokens {
    return this.tokens;
  }

  async teardown(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}