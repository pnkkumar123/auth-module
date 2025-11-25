import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapaDiarioObraHeader } from '../entities/header.entity';
import { MapaDiarioObraDetail } from '../entities/detail.entity';
import { Obra } from '../entities/obra.entity';
import { CreateHeaderDto } from '../dto/create-header.dto';
import { UpdateHeaderDto } from '../dto/update-header.dto';
import { generateBostamp } from '../utils/generate-bostamp';

type UserContext = {
  id: number;
  companyName: string;
  employeeNumber: string;
  roles?: string[] | string;
};

@Injectable()
export class HeadersService {
  constructor(
    @InjectRepository(MapaDiarioObraHeader)
    private readonly headerRepository: Repository<MapaDiarioObraHeader>,

    @InjectRepository(MapaDiarioObraDetail)
    private readonly detailRepository: Repository<MapaDiarioObraDetail>,

    @InjectRepository(Obra)
    private readonly obraRepository: Repository<Obra>,
  ) {}

  // ---------------------- ACCESS HELPERS ----------------------

  private isSupervisor(user: UserContext): boolean {
    if (!user?.roles) return false;
    if (Array.isArray(user.roles)) return user.roles.includes('supervisor');
    return user.roles === 'supervisor';
  }

  private async assertHeaderAccess(
    bostamp: string,
    user: UserContext,
  ): Promise<MapaDiarioObraHeader> {
    const header = await this.headerRepository.findOne({ where: { bostamp } });

    if (!header) throw new NotFoundException(`Header ${bostamp} not found`);

    if (this.isSupervisor(user)) return header;

    // normal user → allow if they created OR match encarregado
    if (header.userid === user.id) return header;
    if (header.employeeNumber === user.employeeNumber) return header;

    throw new ForbiddenException('Access denied to this header');
  }

  private isSameDay(dateA: Date, dateB: Date) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  private async ensureEditable(header: MapaDiarioObraHeader, user: UserContext) {
    if (this.isSupervisor(user)) return;

    const today = new Date();
    if (!this.isSameDay(header.createdAt, today)) {
      throw new ForbiddenException('Cannot modify this header after creation day');
    }

    if (header.userid !== user.id) {
      throw new ForbiddenException('You cannot edit this header');
    }
  }

  // ---------------------- CREATE ----------------------

  async create(dto: CreateHeaderDto, user: UserContext) {
    try {
      const obraExists = await this.obraRepository.findOne({
        where: { obra: dto.obra },
      });
      if (!obraExists) {
        throw new NotFoundException(`Obra '${dto.obra}' not found`);
      }

      if (!dto.encarregado.trim()) {
        throw new BadRequestException('Encarregado cannot be empty');
      }

      const bostamp = generateBostamp();

      const header = this.headerRepository.create({
        bostamp,
        data: dto.data,
        obra: dto.obra,
        encarregado: dto.encarregado,

        // from JWT
        userid: user.id,
        companyName: user.companyName,
        employeeNumber: user.employeeNumber,
      });

      return await this.headerRepository.save(header);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException)
        throw err;
      throw new InternalServerErrorException(
        'Failed to create header: ' + err.message,
      );
    }
  }

  // ---------------------- LIST (PAGINATION) ----------------------

  async findAll(page = 1, user: UserContext) {
    const take = 10;
    const skip = (page - 1) * take;

    try {
      let where: any = {};

      if (!this.isSupervisor(user)) {
        where = [
          { userid: user.id },
          { employeeNumber: user.employeeNumber },
        ];
      }

      const [items, total] = await this.headerRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        take,
        skip,
      });

      return {
        page,
        total,
        totalPages: Math.ceil(total / take),
        items,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch headers: ' + err.message,
      );
    }
  }

  // ---------------------- GET ONE ----------------------

  async findOne(bostamp: string, user: UserContext) {
    return this.assertHeaderAccess(bostamp, user);
  }

  // ---------------------- FULL SHEET ----------------------

  async getFullMdoSheet(bostamp: string, user: UserContext) {
    const header = await this.assertHeaderAccess(bostamp, user);

    const details = await this.detailRepository.find({
      where: { bostamp },
      order: { bistamp: 'ASC' },
    });

    return { header, details };
  }

  // ---------------------- UPDATE ----------------------

  async update(bostamp: string, dto: UpdateHeaderDto, user: UserContext) {
    try {
      const header = await this.assertHeaderAccess(bostamp, user);
      await this.ensureEditable(header, user);

      if (dto.obra) {
        const exists = await this.obraRepository.findOne({
          where: { obra: dto.obra },
        });
        if (!exists) {
          throw new NotFoundException(`Obra '${dto.obra}' not found`);
        }
      }

      if (dto.encarregado !== undefined && dto.encarregado.trim() === '') {
        throw new BadRequestException('Encarregado cannot be empty');
      }

      await this.headerRepository.update(bostamp, dto);
      return this.findOne(bostamp, user);
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      )
        throw err;

      throw new InternalServerErrorException(
        'Failed to update header: ' + err.message,
      );
    }
  }

  // ---------------------- DELETE ----------------------

  async remove(bostamp: string, user: UserContext) {
    try {
      const header = await this.assertHeaderAccess(bostamp, user);
      await this.ensureEditable(header, user);

      await this.detailRepository.delete({ bostamp });
      await this.headerRepository.delete(bostamp);

      return { message: 'Header deleted successfully' };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;

      throw new InternalServerErrorException(
        'Failed to delete header: ' + err.message,
      );
    }
  }
}
