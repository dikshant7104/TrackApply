import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsEmail,
  IsDateString,
  MaxLength,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Google' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  jobTitle: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.SAVED })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ example: '$150,000 - $200,000' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @ApiPropertyOptional({ example: 'New York, NY' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({ example: 'https://jobs.example.com/123' })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  jobUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'jane@company.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  interviewAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resumeId?: string;
}

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

export class ApplicationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Google' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
