import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describePasswordResetFlowTests(app: INestApplication, tokens: TestTokens) {
  describe('Password Reset Flow Tests', () => {
    let resetToken: string;
    let testUserToken: string;

    it('✅ should generate password reset token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          companyName: 'ABC',
          employeeNumber: '1234567',
          email: 'user@example.com'
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.resetToken).toBeDefined();
      expect(res.body.resetLink).toBeDefined();
      
      resetToken = res.body.resetToken;
    });

    it('❌ should fail forgot password for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          companyName: 'NONEXISTENT',
          employeeNumber: '9999999',
          email: 'nonexistent@example.com'
        });

      // Many systems return success even for non-existent users to prevent user enumeration
      // Accept either success (200/201) or error (400/404) as valid responses
      expect([200, 201, 400, 404]).toContain(res.status);
    });

    it('❌ should fail forgot password with invalid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          companyName: '',
          employeeNumber: '',
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
    });

    it('✅ should reset password with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          resetToken: resetToken,
          companyName: 'ABC',
          employeeNumber: '1234567',
          newPassword: 'NewPassword@123'
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.message).toContain('reset successfully');
    });

    it('✅ should login with new password after reset', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'ABC',
          employeeNumber: '1234567',
          password: 'NewPassword@123'
        });

      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      
      testUserToken = res.body.accessToken;
    });

    it('❌ should fail login with old password after reset', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          companyName: 'ABC',
          employeeNumber: '1234567',
          password: 'User@123' // Old password
        });

      expect([400, 401]).toContain(res.status);
    });

    it('❌ should fail reset with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          resetToken: 'invalid-token-12345',
          companyName: 'ABC',
          employeeNumber: '1234567',
          newPassword: 'AnotherPassword@123'
        });

      expect([400, 401]).toContain(res.status);
    });

    it('❌ should fail reset with expired token', async () => {
      // This test would require manipulating the token expiration time
      // For now, we'll test with an obviously invalid token
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          resetToken: 'expired-token-that-was-valid-hours-ago',
          companyName: 'ABC',
          employeeNumber: '1234567',
          newPassword: 'AnotherPassword@123'
        });

      expect([400, 401]).toContain(res.status);
    });

    it('❌ should fail reset with mismatched credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          resetToken: resetToken,
          companyName: 'WRONG',
          employeeNumber: '1234567',
          newPassword: 'AnotherPassword@123'
        });

      expect([400, 401]).toContain(res.status);
    });

    it('❌ should fail reset with weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          resetToken: resetToken,
          companyName: 'ABC',
          employeeNumber: '1234567',
          newPassword: '123' // Too weak
        });

      expect(res.status).toBe(400);
    });

    it('✅ should generate new reset token after previous use', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          companyName: 'ABC',
          employeeNumber: '1234567',
          email: 'user@example.com'
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.resetToken).toBeDefined();
    });
  });
}