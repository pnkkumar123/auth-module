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

    //  Check employee exists in synced employee table
    // const employee = await this.employeeService.findByEmployee(
    //   employeeNumber,
    //   companyName,
    // );

    // if (!employee) {
    //   throw new BadRequestException(
    //     'Employee not found in company records.',
    //   );
    // }

    const employee = true;


    // 2️⃣ Check if user already registered
    const existing = await this.usersRepo.findOne({
      where: { companyName, employeeNumber },
    });
    if (existing) {
      throw new BadRequestException('User already registered.');
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const user = this.usersRepo.create({
      companyName,
      employeeNumber,
      passwordHash,
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
}