import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

const mockApplication = {
  id: 'app-id-1',
  userId: 'user-id-1',
  company: 'Google',
  jobTitle: 'Software Engineer',
  status: ApplicationStatus.APPLIED,
  salary: '$150,000',
  location: 'Mountain View, CA',
  createdAt: new Date(),
  updatedAt: new Date(),
  resume: null,
};

const mockPrisma = {
  jobApplication: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a job application', async () => {
      mockPrisma.jobApplication.create.mockResolvedValue(mockApplication);

      const result = await service.create('user-id-1', {
        company: 'Google',
        jobTitle: 'Software Engineer',
      });

      expect(result).toEqual(mockApplication);
      expect(mockPrisma.jobApplication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            company: 'Google',
            jobTitle: 'Software Engineer',
            userId: 'user-id-1',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated applications', async () => {
      mockPrisma.jobApplication.findMany.mockResolvedValue([mockApplication]);
      mockPrisma.jobApplication.count.mockResolvedValue(1);

      const result = await service.findAll('user-id-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.jobApplication.findMany.mockResolvedValue([]);
      mockPrisma.jobApplication.count.mockResolvedValue(0);

      await service.findAll('user-id-1', { status: ApplicationStatus.INTERVIEW });

      expect(mockPrisma.jobApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ApplicationStatus.INTERVIEW }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single application', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(mockApplication);

      const result = await service.findOne('user-id-1', 'app-id-1');
      expect(result).toEqual(mockApplication);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-id-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an application', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.jobApplication.delete.mockResolvedValue(mockApplication);

      const result = await service.remove('user-id-1', 'app-id-1');
      expect(result.message).toBe('Application deleted successfully');
    });
  });
});
