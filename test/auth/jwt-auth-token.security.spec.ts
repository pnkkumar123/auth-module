import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describeJwtAuthTokenSecurityTests(app: INestApplication, tokens: TestTokens) {
  describe('JWT & Auth Token Security Tests', () => {
    // 🔹 Expired access token
    it('❌ should reject expired access token', async () => {
      // Create an expired token manually
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { sub: 1, companyName: 'SYSTEM', employeeNumber: '0001' },
        'your-secret-key', // This should match your JWT secret
        { expiresIn: '-10s' } // already expired
      );

      const res = await request(app.getHttpServer())
        .get('/modules')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect([401, 403]).toContain(res.status);
    });

    // 🔹 Malformed tokens
    it('❌ missing Bearer should return 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/modules')
        .set('Authorization', tokens.adminToken); // wrong format

      expect(res.status).toBe(401);
    });

    it('❌ random token should return 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/modules')
        .set('Authorization', 'Bearer asdasdasd123');

      expect(res.status).toBe(401);
    });

    it('❌ no token should return 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/modules');

      expect(res.status).toBe(401);
    });

    // 🔹 Token replay attack
    it('❌ reused token after logout should still work (JWT stateless)', async () => {
      // This test demonstrates JWT stateless nature
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      const res = await request(app.getHttpServer())
        .get('/modules')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      // JWT tokens remain valid until expiration
      expect(res.status).toBe(200);
    });
  });
}