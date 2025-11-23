import { INestApplication } from '@nestjs/common';
import { TestTokens } from './test-setup';
import { describeModulesEndpointTests } from './rbac/modules-endpoint.spec';
import { describeRolesEndpointTests } from './rbac/roles-endpoint.spec';
import { describeUserModuleRolesEndpointTests } from './rbac/user-module-roles-endpoint.spec';
import { describeAuthEndpointTests } from './auth/auth-endpoint.spec';
import { describeUsersEndpointTests } from './users/users-endpoint.spec';

export function describeComprehensiveEndpointTesting(app: INestApplication, tokens: TestTokens) {
  describe('🔍 Comprehensive Endpoint Testing', () => {
    // ✅ MODULES ENDPOINT TESTING
    describeModulesEndpointTests(app, tokens);

    // ✅ ROLES ENDPOINT TESTING
    describeRolesEndpointTests(app, tokens);

    // ✅ USER-MODULE-ROLES ENDPOINT TESTING
    describeUserModuleRolesEndpointTests(app, tokens);

    // ✅ AUTH ENDPOINT TESTING
    describeAuthEndpointTests(app);

    // ✅ USERS ENDPOINT TESTING
    describeUsersEndpointTests(app);
  });
}