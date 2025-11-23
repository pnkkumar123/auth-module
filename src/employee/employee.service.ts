import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeEntity } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
  ) {}

  async findByEmployee(employeeNumber: string, companyName: string) {
    return this.employeeRepo.findOne({
      where: {
        employeeNumber: employeeNumber,
        companyName: companyName,
      },
    });
  }

  async findByEmpresaAndNfunc(empresa: string, nfunc: string) {
    return this.employeeRepo.findOne({
      where: {
        companyName: empresa,
        employeeNumber: nfunc,
      },
    });
  }
}
