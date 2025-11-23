import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';

// ✅ Only these imports now
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { ModuleAccess } from '../common/decorators/module-access.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  // ✅ Protect with module-based permission
  @UseGuards(JwtAuthGuard, ModuleAccessGuard)
  @ModuleAccess('HR', 'read') // 👈 change module/action as needed
  @Get('all')
  async findAll() {
    return this.usersService.findAll();
  }
}
