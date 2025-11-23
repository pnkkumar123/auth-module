import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user with company name, employee number, and password. Returns JWT access and refresh tokens.'
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        userId: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  // ✅ LOGIN
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Generate new access and refresh tokens using a valid refresh token'
  })
  @ApiResponse({
    status: 201,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        userId: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Valid refresh token' }
      }
    }
  })
  // ✅ REFRESH TOKEN
  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refresh(token);
  }

  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout user and invalidate refresh token'
  })
  @ApiResponse({ status: 201, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  // ✅ LOGOUT
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({
    summary: 'Get Current User Details',
    description: 'Retrieve details of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sub: { type: 'number', example: 1, description: 'User ID' },
        companyName: { type: 'string', example: 'SYSTEM' },
        employeeNumber: { type: 'string', example: '0001' },
        role: { type: 'string', example: 'ADMIN', description: 'User role' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  // ✅ AUTHENTICATED USER DETAILS
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Request password reset token. User will receive reset instructions via email (in production).'
  })
  @ApiResponse({
    status: 201,
    description: 'Password reset instructions sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset instructions have been sent to your email' },
        resetToken: { type: 'string', example: 'a1b2c3d4e5f6...', description: 'Reset token (for testing only)' },
        resetLink: { type: 'string', example: '/auth/reset-password?token=...&company=...&employee=...' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  // ✅ FORGOT PASSWORD
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(
      dto.companyName,
      dto.employeeNumber,
      dto.email
    );
  }

  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset user password using a valid reset token'
  })
  @ApiResponse({
    status: 201,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @ApiResponse({ status: 400, description: 'Weak password' })
  // ✅ RESET PASSWORD
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.resetToken,
      dto.companyName,
      dto.employeeNumber,
      dto.newPassword
    );
  }
}
