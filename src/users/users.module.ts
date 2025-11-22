import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    EmployeeModule, // to check if employee exists on register
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // used by AuthService
})
export class UsersModule {}
