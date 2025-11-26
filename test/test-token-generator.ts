import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../src/users/entities/user.entity';

/**
 * Simple test token generator that creates JWT tokens with MDO permissions
 * This bypasses the complex RBAC system and just generates proper tokens for testing
 */
export class TestTokenGenerator {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService({
      secret: 'test-secret-key',
      signOptions: { expiresIn: '15m' },
    });
  }

  /**
   * Generate test token with MDO permissions based on user role
   */
  generateToken(user: UserEntity, role: string): string {
    let permissions: string[] = [];
    let roles: string[] = [];

    switch (role) {
      case 'admin':
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
          '*', // Wildcard for admin access
        ];
        roles = ['ADMIN', 'admin'];
        break;

      case 'test-user':
      case 'user':
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
      case 'supervisor':
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

      case 'no-permissions':
        permissions = [];
        roles = [];
        break;

      default:
        permissions = [];
        roles = [];
    }

    const payload = {
      sub: user.id,
      companyName: user.companyName,
      employeeNumber: user.employeeNumber,
      role: role,
      permissions: permissions,
      roles: roles,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Get the permissions that should be included for a specific role
   */
  getPermissionsForRole(role: string): string[] {
    switch (role) {
      case 'admin':
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
      
      case 'test-user':
      case 'user':
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
      case 'supervisor':
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
      
      default:
        return [];
    }
  }
}