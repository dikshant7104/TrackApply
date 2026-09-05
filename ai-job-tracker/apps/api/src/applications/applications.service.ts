import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationQueryDto,
} from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const application = await this.prisma.jobApplication.create({
      data: {
        ...dto,
        userId,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
        interviewAt: dto.interviewAt ? new Date(dto.interviewAt) : undefined,
      },
      include: { resume: true },
    });

    this.logger.log(`Application created: ${application.id} for user ${userId}`);
    return application;
  }

  async findAll(userId: string, query: ApplicationQueryDto) {
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { company: { contains: search, mode: 'insensitive' as const } },
          { jobTitle: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { resume: { select: { id: true, originalName: true } } },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        resume: true,
        coverLetter: true,
        interviewPreps: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application not found`);
    }

    return application;
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.findOne(userId, id);

    const updated = await this.prisma.jobApplication.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
        interviewAt: dto.interviewAt ? new Date(dto.interviewAt) : undefined,
      },
      include: { resume: { select: { id: true, originalName: true } } },
    });

    this.logger.log(`Application updated: ${id}`);
    return updated;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.jobApplication.delete({ where: { id } });
    this.logger.log(`Application deleted: ${id}`);
    return { message: 'Application deleted successfully' };
  }

  async getStats(userId: string) {
    const applications = await this.prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true, createdAt: true },
    });

    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total: applications.length, byStatus };
  }
}
