import { INestApplication } from '@nestjs/common';
import { TestSetup, TestTokens } from '../test-setup';
import { describeMdoEndpointTests } from './mdo-endpoint.e2e-spec';

describe('🗂️ MDO (Mapa Diário Obra) E2E Tests', () => {
  let app: INestApplication;
  let testSetup: TestSetup;
  let tokens: TestTokens;

  beforeAll(async () => {
    testSetup = new TestSetup();
    app = await testSetup.setupApp();
    tokens = await testSetup.setupTestData();
    
    // Run the MDO endpoint tests after setup
    describeMdoEndpointTests(app, tokens);
  }, 30000); // 30 second timeout for beforeAll

  afterAll(async () => {
    await testSetup.teardown();
  });
});