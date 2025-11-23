import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describeModulesEndpointTests(app: INestApplication, tokens: TestTokens) {
  describe('Modules Endpoint Tests', () => {
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

    it('❌ should fail to create duplicate module (409)', async () => {
      // First creation
      const firstRes = await request(app.getHttpServer())
        .post('/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST',
          name: 'Test Module',
          description: 'Test description'
        });

      expect([201, 409]).toContain(firstRes.status);

      // Second creation with same code
      const secondRes = await request(app.getHttpServer())
        .post('/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST',
          name: 'Test Module Duplicate',
          description: 'Different description'
        });

      if (firstRes.status === 201) {
        expect(secondRes.status).toBe(409);
        expect(secondRes.body.message).toContain('already exists');
      }
    });

    it('❌ should fail to create module with empty body (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('❌ should fail to create module without required fields (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Missing code and name'
        });

      expect(res.status).toBe(400);
    });

    it('❌ should fail to update non-existent module (404)', async () => {
      const res = await request(app.getHttpServer())
        .put('/modules/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Non-existent module'
        });

      expect(res.status).toBe(404);
    });

    it('❌ should fail to delete non-existent module (404)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/modules/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('❌ should fail to delete module without token (401)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/modules/1');

      expect(res.status).toBe(401);
    });
  });
}