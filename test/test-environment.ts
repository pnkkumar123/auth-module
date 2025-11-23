import { ConfigModule } from '@nestjs/config';

// Test environment configuration
export const testConfig = ConfigModule.forRoot({
  isGlobal: true,
  load: [() => ({
    // Override database settings for testing
    DB_HOST: process.env.TEST_DB_HOST || 'localhost',
    DB_PORT: process.env.TEST_DB_PORT || 1433,
    DB_USERNAME: process.env.TEST_DB_USERNAME || 'sa',
    DB_PASSWORD: process.env.TEST_DB_PASSWORD || 'Pankaj@2025Secure!',
    DB_NAME: process.env.TEST_DB_NAME || 'app_db_test',
    JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key',
    // Skip employee validation for testing
    SKIP_PE_VALIDATION: process.env.SKIP_PE_VALIDATION || 'true',
  })],
});