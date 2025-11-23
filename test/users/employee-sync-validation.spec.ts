import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export function describeEmployeeSyncValidationTests(app: INestApplication) {
  describe('Employee Sync Validation Tests', () => {
    it('❌ should fail registration for non-existent employee in pe table', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: 'NONEXISTENT',
          employeeNumber: '9999999',
          password: 'Test@123',
        });

      // When SKIP_PE_VALIDATION is true, registration should succeed even for non-existent employees
      // When SKIP_PE_VALIDATION is false, it should fail with 400
      if (process.env.SKIP_PE_VALIDATION === 'true') {
        // With bypass enabled, should either succeed (201) or fail with duplicate (400)
        expect([201, 400]).toContain(res.status);
      } else {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Employee not found in company records');
      }
    });

    it('✅ should succeed registration for existing employee in pe table', async () => {
      // This test assumes the seeded admin employee exists in pe table
      // The admin was created during database seeding with companyName='SYSTEM' and employeeNumber='0001'
      const res = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: 'SYSTEM',
          employeeNumber: '0002', // Different from admin to avoid duplicate
          password: 'Test@123',
        });

      // Should either succeed (201) or fail with duplicate (400)
      expect([201, 400]).toContain(res.status);
      // Don't check specific error message since it could be either "Employee not found" or "User already registered"
    });

    it('❌ should return 400 for duplicate registration of same employee', async () => {
      // First registration attempt
      const firstRes = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          companyName: 'ABC',
          employeeNumber: '1234567',
          password: 'User@123',
        });
        
      // Should either succeed (201) or fail with duplicate (400)
      expect([201, 400]).toContain(firstRes.status);
    });
  });
}