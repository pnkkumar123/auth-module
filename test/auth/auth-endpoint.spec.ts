import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export function describeAuthEndpointTests(app: INestApplication) {
  describe('Auth Endpoint Tests', () => {
    it('❌ should fail login with empty body (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('❌ should fail login with missing required fields (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'SYSTEM'
          // Missing employeeNumber and password
        });

      expect(res.status).toBe(400);
    });

    it('❌ should fail login with invalid company name (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'INVALID',
          employeeNumber: '0001',
          password: 'Admin@123'
        });

      expect([400, 401]).toContain(res.status);
    });
  });
}