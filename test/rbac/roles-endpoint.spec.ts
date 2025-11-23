import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describeRolesEndpointTests(app: INestApplication, tokens: TestTokens) {
  describe('Roles Endpoint Tests', () => {
    let adminToken: string;

    beforeAll(async () => {
      // Get admin token for testing
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'SYSTEM',
          employeeNumber: '0001',
          password: 'Admin@123',
        });
      adminToken = loginRes.body.accessToken;
    });

    it('❌ should fail to create duplicate role (409)', async () => {
      // First creation
      const firstRes = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'TEST_ROLE',
          description: 'Test role description'
        });

      expect([201, 409]).toContain(firstRes.status);

      // Second creation with same name
      const secondRes = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'TEST_ROLE',
          description: 'Different description'
        });

      if (firstRes.status === 201) {
        expect(secondRes.status).toBe(409);
        expect(secondRes.body.message).toContain('already exists');
      }
    });

    it('❌ should fail to create role with empty body (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('❌ should fail to create role without required name (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Missing name field'
        });

      expect(res.status).toBe(400);
    });

    it('❌ should fail to update non-existent role (404)', async () => {
      const res = await request(app.getHttpServer())
        .put('/roles/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Non-existent role'
        });

      expect(res.status).toBe(404);
    });

    it('❌ should fail to delete non-existent role (404)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/roles/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
}