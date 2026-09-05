import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);
  private readonly uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
  }

  async upload(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and Word documents are allowed');
    }

    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 5242880);
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Parse text from PDF if possible
    let parsedText: string | undefined;
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfParse = await import('pdf-parse');
        const data = await pdfParse.default(file.buffer);
        parsedText = data.text.substring(0, 10000);
      } catch (err) {
        this.logger.warn('Failed to parse PDF text', err);
      }
    }

    const storageKey = `${userId}/${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, storageKey);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        filename: path.basename(storageKey),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${storageKey}`,
        storageKey,
        parsedText,
      },
    });

    // Set as default if first resume
    const count = await this.prisma.resume.count({ where: { userId } });
    if (count === 1) {
      await this.prisma.resume.update({
        where: { id: resume.id },
        data: { isDefault: true },
      });
    }

    return resume;
  }

  async findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) throw new NotFoundException('Resume not found');
    return resume;
  }

  async setDefault(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.resume.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.resume.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async remove(userId: string, id: string) {
    const resume = await this.findOne(userId, id);

    try {
      const filePath = path.join(this.uploadDir, resume.storageKey);
      await fs.unlink(filePath);
    } catch (err) {
      this.logger.warn(`Failed to delete file: ${resume.storageKey}`, err);
    }

    await this.prisma.resume.delete({ where: { id } });

    // Set new default if needed
    if (resume.isDefault) {
      const firstResume = await this.prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (firstResume) {
        await this.prisma.resume.update({
          where: { id: firstResume.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Resume deleted successfully' };
  }
}
