import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { EmployeeModule } from '../src/employee/employee.module';
import { ModulesModule } from '../src/rbac/modules/modules.module';
import { RolesModule } from '../src/rbac/roles/roles.module';
import { UserModuleRolesModule } from '../src/rbac/user-module-roles/user-module-roles.module';
import { DatabaseModule } from '../src/database/database.module';

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
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    this.app = moduleRef.createNestApplication();
    this.app.useGlobalPipes(new ValidationPipe());
    
    await this.app.init();
    return this.app;
  }

  async setupTestData(): Promise<TestTokens> {
    const app = this.app;
    
    // Admin login
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        companyName: 'SYSTEM',
        employeeNumber: '0001',
        password: 'Admin@123',
      });

    const adminToken = adminRes.body.accessToken;

    // Register normal user
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        companyName: 'ABC',
        employeeNumber: '1234567',
        password: 'User@123',
      });

    // Normal user login
    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        companyName: 'ABC',
        employeeNumber: '1234567',
        password: 'User@123',
      });

    const userToken = userRes.body.accessToken;
    const userId = userRes.body.userId;

    // Register user without permissions
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        companyName: 'XYZ',
        employeeNumber: '9999999',
        password: 'NoPerm@123',
      });

    // Login user without permissions
    const noPermRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        companyName: 'XYZ',
        employeeNumber: '9999999',
        password: 'NoPerm@123',
      });

    const userWithoutPermissionsToken = noPermRes.body.accessToken;
    const userWithoutPermissionsId = noPermRes.body.userId;

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