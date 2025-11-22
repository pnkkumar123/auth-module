import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Called by LocalStrategy
  async validateUser(employeeNumber: string, password: string) {
    const user = await this.usersService.findByEmployeeNumber(employeeNumber);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user; // Returned to request.user
  }

  // Called after login success
  async login(user: any) {
  const payload = {
    sub: user.id,
    companyName: user.companyName,
    employeeNumber: user.employeeNumber,
    role: user.role,
  };

  // ✅ generate access token (15m or 1h)
  const accessToken = this.jwtService.sign(payload, {
    expiresIn: '15m',
  });

  // ✅ generate refresh token (7 days)
  const refreshToken = this.jwtService.sign(payload, {
    expiresIn: '7d',
  });

  // ✅ hash and store refresh token in DB
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await this.usersService.updateRefreshToken(user.id, hashedRefresh);

  return {
    accessToken,
    refreshToken,
  };
}
async refresh(token: string) {
  const payload = this.jwtService.verify(token);
  const user = await this.usersService.findById(payload.sub);

  if (!user || !user.refreshTokenHash) {
    throw new UnauthorizedException('Invalid token');
  }

  const isValid = await bcrypt.compare(token, user.refreshTokenHash);
  if (!isValid) {
    throw new UnauthorizedException('Token expired or invalid');
  }

  return this.login(user); // ✅ generate new tokens
}

async logout(userId: number) {
  // refresh token ko null kar do → dobara use nahi ho payega
await this.usersService.updateRefreshToken(userId, null);

  return { message: 'Logged out successfully' };
}


}
