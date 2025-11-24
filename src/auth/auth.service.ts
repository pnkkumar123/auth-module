import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  // ✅ generate access token (configurable via environment)
  const accessToken = this.jwtService.sign(payload, {
    expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m') as any,
  });

  // ✅ generate refresh token (configurable via environment)
  const refreshToken = this.jwtService.sign(payload, {
    expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d') as any,
  });

  // ✅ hash and store refresh token in DB
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await this.usersService.updateRefreshToken(user.id, hashedRefresh);

  return {
    accessToken,
    refreshToken,
    userId: user.id,
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

async forgotPassword(companyName: string, employeeNumber: string, email: string) {
  // Find user by company and employee number
  const user = await this.usersService.findByCompanyAndEmployee(companyName, employeeNumber);
  
  if (!user) {
    throw new NotFoundException('User not found with provided credentials');
  }

  // Generate reset token
  const resetToken = await this.usersService.generatePasswordResetToken(user.id);
  
  // In a real application, you would send an email here
  // For now, we'll return the reset token (in production, this should be sent via email)
  return {
    message: 'Password reset instructions have been sent to your email',
    resetToken, // This is for testing purposes - remove in production
    resetLink: `/auth/reset-password?token=${resetToken}&company=${companyName}&employee=${employeeNumber}`
  };
}

async resetPassword(resetToken: string, companyName: string, employeeNumber: string, newPassword: string) {
  // Validate the reset token
  const user = await this.usersService.validateResetToken(resetToken, companyName, employeeNumber);
  
  if (!user) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Reset the password
  await this.usersService.resetPassword(user.id, newPassword);
  
  // Clear any existing refresh tokens for security
  await this.usersService.clearRefreshToken(user.id);

  return { message: 'Password has been reset successfully' };
}


}
