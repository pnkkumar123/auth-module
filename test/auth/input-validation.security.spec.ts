import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export function describeInputValidationSecurityTests(app: INestApplication) {
  describe('Input Validation Security Tests', () => {
    // 🔹 missing fields
    it('❌ register without body should return 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({});

      expect(res.status).toBe(400);
    });

    // 🔹 SQL injection attempt
    it('❌ SQL injection should be handled gracefully', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: "ABC'; DROP TABLE users --",
          employeeNumber: '999',
          password: 'User@123'
        });

      // The system should handle this gracefully - either reject or accept safely
      expect([201, 400]).toContain(res.status);
    });
  });
}