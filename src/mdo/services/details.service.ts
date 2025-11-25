import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapaDiarioObraDetail } from '../entities/detail.entity';
import { MapaDiarioObraHeader } from '../entities/header.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { EmployeeEntity } from '../../employee/entities/employee.entity';
import { CreateDetailDto } from '../dto/create-detail.dto';
import { UpdateDetailDto } from '../dto/update-detail.dto';
import { generateBistamp } from '../utils/generate-bistamp';

type UserContext = {
  id?: number;
  name?: string;
  roles?: string[] | string;
};

@Injectable()
export class DetailsService {
  constructor(
    @InjectRepository(MapaDiarioObraDetail)
    private readonly detailRepository: Repository<MapaDiarioObraDetail>,

    @InjectRepository(MapaDiarioObraHeader)
    private readonly headerRepository: Repository<MapaDiarioObraHeader>,

    @InjectRepository(Equipamento)
    private readonly equipamentoRepository: Repository<Equipamento>,

    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}

  // -----------------------------------------------------
  private isSupervisor(user: UserContext): boolean {
    if (!user) return false;
    if (Array.isArray(user.roles)) return user.roles.includes('supervisor');
    return user.roles === 'supervisor';
  }

  private async assertHeaderAccess(bostamp: string, user: UserContext) {
    const header = await this.headerRepository.findOne({ where: { bostamp } });
    if (!header) throw new NotFoundException(`Header ${bostamp} not found`);
    if (this.isSupervisor(user)) return header;

    if (header.userid === user?.id) return header;
    if (header.encarregado && user?.name && header.encarregado === user.name) return header;

    throw new ForbiddenException('Access denied to this header');
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private async ensureHeaderEditable(header: MapaDiarioObraHeader, user: UserContext) {
    if (this.isSupervisor(user)) return;

    const today = new Date();
    if (!this.isSameDay(header.createdAt, today)) {
      throw new ForbiddenException('Cannot modify this record after its creation date');
    }

    if (header.userid === user?.id) return;
    if (header.encarregado === user?.name) return;

    throw new ForbiddenException('Access denied to modify this header');
  }

  // -----------------------------------------------------
  // CREATE DETAIL
  // -----------------------------------------------------
  async create(createDetailDto: CreateDetailDto, user: UserContext): Promise<MapaDiarioObraDetail> {
    try {
      const header = await this.assertHeaderAccess(createDetailDto.bostamp, user);
      await this.ensureHeaderEditable(header, user);

      const hasLabor = !!(createDetailDto.empresa || createDetailDto.nfunc);
      const hasEquipment = !!createDetailDto.codviat;

      if (hasLabor && hasEquipment) {
        throw new BadRequestException('Row must be either labor OR equipment');
      }
      if (!hasLabor && !hasEquipment) {
        throw new BadRequestException('Provide either empresa+nfunc OR codviat');
      }

      let design: string | undefined;

      if (hasLabor) {
        if (!createDetailDto.empresa || !createDetailDto.nfunc) {
          throw new BadRequestException('empresa and nfunc required for labor row');
        }

        const employee = await this.employeeRepository.findOne({
          where: {
            companyName: createDetailDto.empresa,
            employeeNumber: createDetailDto.nfunc,
          },
        });

        if (!employee) {
          throw new NotFoundException(
            `Employee not found for empresa=${createDetailDto.empresa}, nfunc=${createDetailDto.nfunc}`,
          );
        }

        design = employee.fullName;
      }

      if (hasEquipment) {
        const equipamento = await this.equipamentoRepository.findOne({
          where: { codviat: createDetailDto.codviat },
        });

        if (!equipamento) {
          throw new NotFoundException(`Equipamento '${createDetailDto.codviat}' not found`);
        }

        design = equipamento.desig;
      }

      const bistamp = generateBistamp();

      const detail = this.detailRepository.create({
        ...createDetailDto,
        bistamp,
        design,
        qtt: createDetailDto.qtt ?? 0,
      });

      return await this.detailRepository.save(detail);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;

      throw new InternalServerErrorException('Failed to create detail: ' + error.message);
    }
  }

  // -----------------------------------------------------
  // FIND ONE DETAIL
  // -----------------------------------------------------
  async findOne(bistamp: string, user: UserContext): Promise<MapaDiarioObraDetail> {
    try {
      const detail = await this.detailRepository.findOne({ where: { bistamp } });
      if (!detail) throw new NotFoundException(`Detail ${bistamp} not found`);

      await this.assertHeaderAccess(detail.bostamp, user);
      return detail;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Failed to fetch detail');
    }
  }

  // -----------------------------------------------------
  // FIND DETAILS BY HEADER
  // -----------------------------------------------------
  async findByHeaderBostamp(bostamp: string, user: UserContext): Promise<MapaDiarioObraDetail[]> {
    await this.assertHeaderAccess(bostamp, user);

    return this.detailRepository.find({
      where: { bostamp },
      order: { bistamp: 'ASC' },
    });
  }

  // -----------------------------------------------------
  // UPDATE DETAIL
  // -----------------------------------------------------
  async update(bistamp: string, dto: UpdateDetailDto, user: UserContext): Promise<MapaDiarioObraDetail> {
    try {
      const existing = await this.detailRepository.findOne({ where: { bistamp } });
      if (!existing) throw new NotFoundException(`Detail ${bistamp} not found`);

      const header = await this.assertHeaderAccess(existing.bostamp, user);
      await this.ensureHeaderEditable(header, user);

      // Can't update to both labor + equipment
      const hasLabor = !!(dto.empresa || dto.nfunc);
      const hasEquipment = !!dto.codviat;
      if (hasLabor && hasEquipment) {
        throw new BadRequestException('Row must be either labor OR equipment');
      }

      let design: string | undefined;

      if (hasLabor) {
        if (!dto.empresa || !dto.nfunc) {
          throw new BadRequestException('empresa and nfunc required for labor');
        }

        const emp = await this.employeeRepository.findOne({
          where: { companyName: dto.empresa, employeeNumber: dto.nfunc },
        });

        if (!emp) {
          throw new NotFoundException(
            `Employee not found empresa=${dto.empresa} nfunc=${dto.nfunc}`,
          );
        }

        design = emp.fullName;
      }

      if (hasEquipment) {
        const equipamento = await this.equipamentoRepository.findOne({
          where: { codviat: dto.codviat },
        });
        if (!equipamento) throw new NotFoundException(`Equipamento ${dto.codviat} not found`);
        design = equipamento.desig;
      }

      await this.detailRepository.update(bistamp, {
        ...dto,
        design,
      });

      return this.findOne(bistamp, user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;

      throw new InternalServerErrorException('Failed to update detail');
    }
  }

  // -----------------------------------------------------
  // DELETE DETAIL
  // -----------------------------------------------------
  async remove(bistamp: string, user: UserContext) {
    const existing = await this.detailRepository.findOne({ where: { bistamp } });
    if (!existing) throw new NotFoundException(`Detail ${bistamp} not found`);

    const header = await this.assertHeaderAccess(existing.bostamp, user);
    await this.ensureHeaderEditable(header, user);

    await this.detailRepository.delete(bistamp);
    return { message: 'Detail deleted successfully' };
  }
}
