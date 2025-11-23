import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AUTH + RBAC E2E ✅', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('✅ Admin login should return access token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        companyName: 'SYSTEM',
        employeeNumber: '0001',
        password: 'Admin@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();

    adminToken = res.body.accessToken;
  });

  it('✅ Register normal user successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        companyName: 'ABC',
        employeeNumber: '1234567',
        password: 'User@123',
      });

    expect(res.status).toBe(201);
  });

  it('✅ Normal user login should work', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        companyName: 'ABC',
        employeeNumber: '1234567',
        password: 'User@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();

    userToken = res.body.accessToken;
  });

  it('❌ Normal user should get 403 on GET /modules', async () => {
    const res = await request(app.getHttpServer())
      .get('/modules')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('✅ Admin should be able to assign role to user', async () => {
    const res = await request(app.getHttpServer())
      .post('/user-module-roles/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 2,
        moduleId: 1,
        roleId: 1,
        canRead: true,
      });

    expect(res.status).toBe(201);
  });

  it('✅ Now normal user should access GET /modules', async () => {
    const res = await request(app.getHttpServer())
      .get('/modules')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});
