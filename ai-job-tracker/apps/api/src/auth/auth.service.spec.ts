import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-access-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret-key-that-is-long-enough-32chars',
                JWT_REFRESH_SECRET: 'test-refresh-secret-key-32chars!!',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Test123!@',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        createdAt: new Date(),
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id',
        token: 'refresh-token',
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Test123!@',
    };

    it('should login user with valid credentials', async () => {
      const hashedPassword = await argon2.hash('Test123!@');
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id-1',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        isActive: true,
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({
        token: 'refresh-token',
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const hashedPassword = await argon2.hash('WrongPass123!');
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id-1',
        email: 'test@example.com',
        password: hashedPassword,
        isActive: true,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const hashedPassword = await argon2.hash('Test123!@');
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id-1',
        email: 'test@example.com',
        password: hashedPassword,
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke all tokens when no refresh token provided', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.logout('user-id-1');

      expect(result.message).toBe('Logged out successfully');
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        data: { isRevoked: true },
      });
    });
  });
});
