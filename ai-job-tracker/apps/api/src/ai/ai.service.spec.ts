import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

const mockApplication = {
  id: 'app-id-1',
  userId: 'user-id-1',
  company: 'Google',
  jobTitle: 'Software Engineer',
  jobDescription: 'We need a skilled software engineer with TypeScript, React, Node.js expertise.',
  status: 'APPLIED',
};

const mockResume = {
  id: 'resume-id-1',
  userId: 'user-id-1',
  parsedText: 'Experienced software engineer with 5 years of TypeScript, React, and Node.js.',
  isDefault: true,
  originalName: 'resume.pdf',
};

const mockPrisma = {
  jobApplication: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  resume: {
    findFirst: jest.fn(),
  },
  coverLetter: {
    create: jest.fn(),
  },
  interviewPrep: {
    create: jest.fn(),
  },
  aiGeneration: {
    create: jest.fn(),
  },
};

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              // No API key = mock responses
              if (key === 'OPENAI_API_KEY') return '';
              if (key === 'OPENAI_MODEL') return 'gpt-4o';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('generateCoverLetter', () => {
    it('should generate a cover letter with mock response', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.resume.findFirst.mockResolvedValue(mockResume);
      mockPrisma.coverLetter.create.mockResolvedValue({
        id: 'cl-id-1',
        title: 'Cover Letter - Google - Software Engineer',
        content: 'Dear Hiring Manager...',
      });
      mockPrisma.aiGeneration.create.mockResolvedValue({});

      const result = await service.generateCoverLetter('user-id-1', 'app-id-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content');
      expect(mockPrisma.coverLetter.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if application not found', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(null);

      await expect(
        service.generateCoverLetter('user-id-1', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateMatchScore', () => {
    it('should return a match score with mock response', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.resume.findFirst.mockResolvedValue(mockResume);
      mockPrisma.jobApplication.update.mockResolvedValue({});
      mockPrisma.aiGeneration.create.mockResolvedValue({});

      const result = await service.calculateMatchScore('user-id-1', 'app-id-1', 'resume-id-1');

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('suggestions');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.matchedSkills)).toBe(true);
    });

    it('should throw NotFoundException if resume not found', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.resume.findFirst.mockResolvedValue(null);

      await expect(
        service.calculateMatchScore('user-id-1', 'app-id-1', 'invalid-resume'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateInterviewQuestions', () => {
    it('should generate interview questions with mock response', async () => {
      mockPrisma.jobApplication.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewPrep.create.mockResolvedValue({
        id: 'ip-id-1',
        questions: [],
      });
      mockPrisma.aiGeneration.create.mockResolvedValue({});

      const result = await service.generateInterviewQuestions('user-id-1', 'app-id-1', 5);

      expect(result).toHaveProperty('questions');
      expect(Array.isArray(result.questions)).toBe(true);
      expect(result.questions.length).toBeGreaterThan(0);
    });
  });

  describe('summarizeJobDescription', () => {
    it('should summarize a job description', async () => {
      mockPrisma.aiGeneration.create.mockResolvedValue({});

      const result = await service.summarizeJobDescription(
        'user-id-1',
        'We are looking for a Senior Software Engineer with 5+ years of experience in TypeScript and React.',
      );

      expect(result).toHaveProperty('summary');
    });
  });
});
