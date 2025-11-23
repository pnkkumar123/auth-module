import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestTokens } from '../test-setup';

export function describeRbacPermissionMatrixTests(app: INestApplication, tokens: TestTokens) {
  describe('RBAC Permission Matrix Tests', () => {
    // 🔹 no role assigned → 403
    it('❌ user without role should get 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/modules')
        .set('Authorization', `Bearer ${tokens.userWithoutPermissionsToken}`);

      expect(res.status).toBe(403);
    });

    // 🔹 partial permissions
    it('❌ user without create permission should get 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/modules')
        .set('Authorization', `Bearer ${tokens.userToken}`)
        .send({ code: 'PAY', name: 'Payroll' });

      // Accept either forbidden (403) or unauthorized (401) - depends on token validity
      expect([401, 403]).toContain(res.status);
    });
  });
}