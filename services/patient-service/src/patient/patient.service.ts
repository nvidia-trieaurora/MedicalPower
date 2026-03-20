import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientDto) {
    const existing = await this.prisma.patient.findUnique({
      where: {
        mrn_organizationId: {
          mrn: dto.mrn,
          organizationId: dto.organizationId,
        },
      },
    });

    if (existing) {
      throw new ConflictException({
        code: 'PATIENT_DUPLICATE_MRN',
        message: `Patient with MRN ${dto.mrn} already exists`,
        message_key: 'patient.error.duplicateMrn',
      });
    }

    return this.prisma.patient.create({
      data: {
        mrn: dto.mrn,
        fullName: dto.fullName,
        dob: new Date(dto.dob),
        gender: dto.gender,
        nationalId: dto.nationalId,
        phone: dto.phone,
        address: dto.address,
        organizationId: dto.organizationId,
      },
    });
  }

  async findAll(query: QueryPatientDto, organizationId: string) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status && { status }),
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { mrn: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        cases: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        studies: {
          orderBy: { studyDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException({
        code: 'PATIENT_NOT_FOUND',
        message: `Patient with ID ${id} not found`,
        message_key: 'patient.error.notFound',
      });
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.dob && { dob: new Date(dto.dob) }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.nationalId !== undefined && { nationalId: dto.nationalId }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }
}
