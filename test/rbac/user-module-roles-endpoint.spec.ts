import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describeUserModuleRolesEndpointTests(app: INestApplication, tokens: TestTokens) {
  describe('User Module Roles Endpoint Tests', () => {
    let adminToken: string;
    let testUserId: number;
    let testModuleId = 1;
    let testRoleId = 1;

    beforeAll(async () => {
      // Get admin token and create test user
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'SYSTEM',
          employeeNumber: '0001',
          password: 'Admin@123',
        });
      adminToken = loginRes.body.accessToken;

      // Create a test user
      const userRes = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: 'TEST',
          employeeNumber: '9999999',
          password: 'Test@123',
        });
      
      if (userRes.status === 201) {
        testUserId = userRes.body.userId;
      } else {
        // If user already exists, try to login to get the ID
        const loginTestRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            companyName: 'TEST',
            employeeNumber: '9999999',
            password: 'Test@123',
          });
        if (loginTestRes.status === 201) {
          testUserId = loginTestRes.body.userId;
        } else {
          testUserId = 2; // Fallback to a known user ID
        }
      }
    });

    it('❌ should fail to assign duplicate user-module-role (409)', async () => {
      const assignmentData = {
        userId: testUserId,
        moduleId: testModuleId,
        roleId: testRoleId,
        canRead: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      };

      // First assignment
      const firstRes = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignmentData);

      expect([201, 409]).toContain(firstRes.status);

      // Second assignment with same data
      const secondRes = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignmentData);

      if (firstRes.status === 201) {
        expect(secondRes.status).toBe(409);
        expect(secondRes.body.message).toContain('already exists');
      }
    });

    it('❌ should fail to assign with empty body (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('❌ should fail to assign with missing required fields (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          canRead: true,
          canCreate: false
          // Missing userId, moduleId, roleId
        });

      expect(res.status).toBe(400);
    });

    it('❌ should fail to assign with invalid user ID (404)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 99999,
          moduleId: testModuleId,
          roleId: testRoleId,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        });

      expect(res.status).toBe(404);
    });

    it('❌ should fail to assign with invalid module ID (404)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          moduleId: 99999,
          roleId: testRoleId,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        });

      expect(res.status).toBe(404);
    });

    it('❌ should fail to assign with invalid role ID (404)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          moduleId: testModuleId,
          roleId: 99999,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        });

      expect(res.status).toBe(404);
    });

    it('❌ should fail to assign without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-module-roles/assign')
        .send({
          userId: testUserId,
          moduleId: testModuleId,
          roleId: testRoleId,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        });

      expect(res.status).toBe(401);
    });

    it('❌ should fail to assign with invalid permissions (403)', async () => {
      // Try with normal user token instead of admin
      const normalUserRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'ABC',
          employeeNumber: '1234567',
          password: 'User@123',
        });

      if (normalUserRes.status === 201) {
        const userToken = normalUserRes.body.accessToken;

        const res = await request(app.getHttpServer())
          .post('/user-module-roles/assign')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            userId: testUserId,
            moduleId: testModuleId,
            roleId: testRoleId,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false
          });

        expect([403, 401]).toContain(res.status);
      }
    });
  });
}