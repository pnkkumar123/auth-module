import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Obra } from '../../src/mdo/entities/obra.entity';
import { Equipamento } from '../../src/mdo/entities/equipamento.entity';
import { EmployeeEntity } from '../../src/employee/entities/employee.entity';

/**
 * Test-only MDO seed service that inserts required test data
 * This ensures all MDO business logic validations pass during testing
 */
@Injectable()
export class MdoTestSeedService {
  private readonly logger = new Logger(MdoTestSeedService.name);

  constructor(
    @InjectRepository(Obra)
    private readonly obraRepository: Repository<Obra>,
    @InjectRepository(Equipamento)
    private readonly equipamentoRepository: Repository<Equipamento>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}

  /**
   * Seed all required MDO test data
   */
  async seedMdoTestData(): Promise<void> {
    this.logger.log('Seeding MDO test data...');

    await this.seedTestObra();
    await this.seedTestEmployee();
    await this.seedTestEquipamento();

    this.logger.log('MDO test data seeded successfully');
  }

  /**
   * Seed a valid Obra that satisfies MDO business rules
   * situacao must start with 3, 4, 5, or 7
   */
  private async seedTestObra(): Promise<void> {
    const existingObra = await this.obraRepository.findOne({ 
      where: { obra: 'TEST-OBRA-001' } 
    });

    if (existingObra) {
      this.logger.log('Test obra already exists, skipping');
      return;
    }

    const testObra = this.obraRepository.create({
      obra: 'TEST-OBRA-001',
      nome: 'Test Obra',
      situacao: '3-TEST', // Must start with 3, 4, 5, or 7
    });

    await this.obraRepository.save(testObra);
    this.logger.log('Created test obra: TEST-OBRA-001');
  }

  /**
   * Seed a test employee for labor detail validation
   * Must match the companyName and employeeNumber used in tests
   */
  private async seedTestEmployee(): Promise<void> {
    const existingEmployee = await this.employeeRepository.findOne({ 
      where: { 
        companyName: 'TEST-COMPANY',
        employeeNumber: '1234567' 
      } 
    });

    if (existingEmployee) {
      this.logger.log('Test employee already exists, skipping');
      return;
    }

    const testEmployee = this.employeeRepository.create({
      companyName: 'TEST-COMPANY',
      employeeNumber: '1234567',
      fullName: 'Test Employee',
    });

    await this.employeeRepository.save(testEmployee);
    this.logger.log('Created test employee: TEST-COMPANY-1234567');
  }

  /**
   * Seed a test equipment for equipment detail validation
   * Must be active (inactivo = 0) and match test expectations
   */
  private async seedTestEquipamento(): Promise<void> {
    const existingEquipamento = await this.equipamentoRepository.findOne({ 
      where: { codviat: 'EQ-001' } 
    });

    if (existingEquipamento) {
      this.logger.log('Test equipamento already exists, skipping');
      return;
    }

    const testEquipamento = this.equipamentoRepository.create({
      codviat: 'EQ-001',
      desig: 'Test Equipment',
      inactivo: 0, // Must be 0 for active equipment
    });

    await this.equipamentoRepository.save(testEquipamento);
    this.logger.log('Created test equipamento: EQ-001');
  }

  /**
   * Clean up test MDO data (optional, for test cleanup)
   */
  async cleanupMdoTestData(): Promise<void> {
    this.logger.log('Cleaning up MDO test data...');

    await this.obraRepository.delete({ obra: 'TEST-OBRA-001' });
    await this.employeeRepository.delete({ 
      companyName: 'TEST-COMPANY',
      employeeNumber: '1234567' 
    });
    await this.equipamentoRepository.delete({ codviat: 'EQ-001' });

    this.logger.log('MDO test data cleaned up');
  }
}