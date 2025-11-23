import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly employeeService: EmployeeService,
  ) {}

  async findByEmployeeNumber(employeeNumber: string) {
    return this.usersRepo.findOne({ where: { employeeNumber } });
  }

  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }
  async findAll() {
  return this.usersRepo.find();
}


  async register(dto: RegisterDto) {
    const { companyName, employeeNumber, password } = dto;

    // 1️⃣ Check employee exists in "pe" table using correct column names
    // TEMPORARY BYPASS for local testing only
    if (process.env.SKIP_PE_VALIDATION === 'true') {
      // Skip pe table validation for local testing
      console.log('⚠️  SKIP_PE_VALIDATION is active - bypassing pe table validation');
    } else {
      // PRODUCTION: Real validation against pe table
      const employee = await this.employeeService.findByEmpresaAndNfunc(
        companyName,
        employeeNumber,
      );

      if (!employee) {
        throw new BadRequestException('Employee not found in company records.');
      }
    }

    // 2️⃣ Check if user already registered
    const existing = await this.usersRepo.findOne({
      where: { companyName, employeeNumber },
    });
    if (existing) {
      throw new BadRequestException('User already registered.');
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Create user with employee full name if available
    const user = this.usersRepo.create({
      companyName,
      employeeNumber,
      passwordHash,
      // You can store employee full name if needed
      // fullName: employee.fullName,
    });

    const saved = await this.usersRepo.save(user);

    // Don’t return passwordHash
    const { passwordHash: _, ...safeUser } = saved;
    return safeUser;
  }
async updateRefreshToken(userId: number, refreshTokenHash: string | null) {
  await this.usersRepo
    .createQueryBuilder()
    .update(UserEntity)
    .set({ refreshTokenHash })
    .where("id = :id", { id: userId })
    .execute();
}

async clearRefreshToken(userId: number) {
  await this.usersRepo
    .createQueryBuilder()
    .update(UserEntity)
    .set({ refreshTokenHash: null })
    .where("id = :id", { id: userId })
    .execute();
}

async findByCompanyAndEmployee(companyName: string, employeeNumber: string) {
  return this.usersRepo.findOne({
    where: { companyName, employeeNumber }
  });
}

async generatePasswordResetToken(userId: number): Promise<string> {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

  await this.usersRepo
    .createQueryBuilder()
    .update(UserEntity)
    .set({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: resetExpires
    })
    .where("id = :id", { id: userId })
    .execute();

  return resetToken;
}

async validateResetToken(resetToken: string, companyName: string, employeeNumber: string): Promise<UserEntity | null> {
  const user = await this.findByCompanyAndEmployee(companyName, employeeNumber);
  
  if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
    return null;
  }

  // Check if token is expired
  if (user.resetPasswordExpires < new Date()) {
    return null;
  }

  // Verify the reset token
  const isValid = await bcrypt.compare(resetToken, user.resetPasswordToken);
  if (!isValid) {
    return null;
  }

  return user;
}

async resetPassword(userId: number, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await this.usersRepo
    .createQueryBuilder()
    .update(UserEntity)
    .set({
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    })
    .where("id = :id", { id: userId })
    .execute();
}
}