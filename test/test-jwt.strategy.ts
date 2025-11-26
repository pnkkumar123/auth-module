import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';

/**
 * Test-only JWT strategy that validates tokens with MDO permissions
 * This is ONLY used in test environment to simulate proper RBAC validation
 */
@Injectable()
export class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test-secret-key', // Same as test setup
    });
  }

  async validate(payload: any) {
    // Return user object with permissions for RBAC guards
    return {
      id: payload.sub,
      companyName: payload.companyName,
      employeeNumber: payload.employeeNumber,
      role: payload.role,
      permissions: payload.permissions || [],
      roles: payload.roles || [],
    };
  }
}