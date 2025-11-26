import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../src/users/entities/user.entity';

/**
 * Test-only auth service that includes MDO permissions in JWT tokens
 * This is ONLY used in test environment to simulate proper RBAC
 */
@Injectable()
export class TestAuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate test JWT token with MDO permissions included
   * This simulates what the real RBAC system would do
   */
  generateTestToken(user: UserEntity, userRole: string): string {
    // Define MDO permissions based on user role
    let permissions: string[] = [];
    let roles: string[] = [];

    switch (userRole) {
      case 'test-user':
        permissions = [
          'mdo.headers.create',
          'mdo.headers.read',
          'mdo.details.create',
          'mdo.details.read',
          'mdo.details.update',
          'mdo.details.delete',
          'mdo.import',
          'mdo.autocomplete.obras',
          'mdo.autocomplete.equipamentos',
        ];
        roles = ['test-user'];
        break;

      case 'test-supervisor':
        permissions = [
          'mdo.headers.create',
          'mdo.headers.read',
          'mdo.headers.update',
          'mdo.headers.delete',
          'mdo.details.create',
          'mdo.details.read',
          'mdo.details.update',
          'mdo.details.delete',
          'mdo.import',
          'mdo.autocomplete.obras',
          'mdo.autocomplete.equipamentos',
        ];
        roles = ['test-supervisor'];
        break;

      case 'admin':
      case 'test-admin':
        // Admin gets all permissions (bypasses everything)
        permissions = [
          'mdo.headers.create',
          'mdo.headers.read',
          'mdo.headers.update',
          'mdo.headers.delete',
          'mdo.details.create',
          'mdo.details.read',
          'mdo.details.update',
          'mdo.details.delete',
          'mdo.import',
          'mdo.autocomplete.obras',
          'mdo.autocomplete.equipamentos',
          // Add any other permissions that might be needed
          '*', // Wildcard for admin access
        ];
        roles = ['ADMIN', 'test-admin'];
        break;

      default:
        permissions = [];
        roles = [];
    }

    const payload = {
      sub: user.id,
      companyName: user.companyName,
      employeeNumber: user.employeeNumber,
      role: userRole,
      permissions: permissions,
      roles: roles,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: 'test-secret-key', // Use same secret as test setup
    });
  }

  /**
   * Get MDO permissions for a specific user role
   * This is used to verify what permissions a user should have
   */
  getMdoPermissionsForRole(role: string): string[] {
    switch (role) {
      case 'test-user':
        return [
          'mdo.headers.create',
          'mdo.headers.read',
          'mdo.details.create',
          'mdo.details.read',
          'mdo.details.update',
          'mdo.details.delete',
          'mdo.import',
          'mdo.autocomplete.obras',
          'mdo.autocomplete.equipamentos',
        ];
      
      case 'test-supervisor':
        return [
          'mdo.headers.create',
          'mdo.headers.read',
          'mdo.headers.update',
          'mdo.headers.delete',
          'mdo.details.create',
          'mdo.details.read',
          'mdo.details.update',
          'mdo.details.delete',
          'mdo.import',
          'mdo.autocomplete.obras',
          'mdo.autocomplete.equipamentos',
        ];
      
      case 'admin':
      case 'test-admin':
        return ['*']; // Admin has all permissions
      
      default:
        return [];
    }
  }
}