import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describeLogoutBehaviorTests(app: INestApplication, tokens: TestTokens) {
  describe('Logout Behavior Tests', () => {
    it('✅ logout twice should still return success', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect([200, 201]).toContain(res.status);
    });
  });
}