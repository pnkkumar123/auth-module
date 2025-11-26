import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../src/rbac/roles/entities/role.entity';
import { BusinessModuleEntity } from '../src/rbac/modules/entities/business-module.entity';
import { UserEntity } from '../src/users/entities/user.entity';
import { UserModuleRoleEntity } from '../src/rbac/user-module-roles/entities/user-module-role.entity';
import { TestJwtStrategy } from './test-jwt.strategy';
import { TestAuthService } from './test-auth.service';
import { TestRbacSeeder } from './test-rbac-seeder';

/**
 * Test-only auth module that provides JWT tokens with MDO permissions
 * This overrides the real auth module in test environment
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'test-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([
      RoleEntity,
      BusinessModuleEntity,
      UserEntity,
      UserModuleRoleEntity,
    ]),
  ],
  providers: [
    TestAuthService,
    TestJwtStrategy,
    TestRbacSeeder,
  ],
  exports: [
    TestAuthService,
    TestJwtStrategy,
    TestRbacSeeder,
  ],
})
export class TestAuthModule {}