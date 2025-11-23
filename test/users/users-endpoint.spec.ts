import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export function describeUsersEndpointTests(app: INestApplication) {
  describe('Users Endpoint Tests', () => {
    it('❌ should fail registration with empty body (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({});

      expect(res.status).toBe(400);
    });

    it('❌ should fail registration with missing required fields (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: 'TEST'
          // Missing employeeNumber and password
        });

      expect(res.status).toBe(400);
    });

    it('❌ should fail registration with weak password (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: 'TEST',
          employeeNumber: '9999998',
          password: '123' // Too weak
        });

      expect(res.status).toBe(400);
    });
  });
}