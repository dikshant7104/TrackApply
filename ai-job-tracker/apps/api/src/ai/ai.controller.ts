import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GenerateCoverLetterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

class MatchScoreDto {
  @ApiProperty()
  @IsString()
  resumeId: string;
}

class InterviewQuestionsDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(20)
  questionCount?: number;
}

class JobSummaryDto {
  @ApiProperty()
  @IsString()
  jobDescription: string;
}

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('applications/:id/cover-letter')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate AI cover letter for an application' })
  generateCoverLetter(
    @CurrentUser() user: JwtPayload,
    @Param('id') applicationId: string,
    @Body() dto: GenerateCoverLetterDto,
  ) {
    return this.aiService.generateCoverLetter(user.sub, applicationId, dto.additionalContext);
  }

  @Post('applications/:id/match-score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate resume-job match score' })
  calculateMatchScore(
    @CurrentUser() user: JwtPayload,
    @Param('id') applicationId: string,
    @Body() dto: MatchScoreDto,
  ) {
    return this.aiService.calculateMatchScore(user.sub, applicationId, dto.resumeId);
  }

  @Post('applications/:id/interview-questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate interview questions for an application' })
  generateInterviewQuestions(
    @CurrentUser() user: JwtPayload,
    @Param('id') applicationId: string,
    @Body() dto: InterviewQuestionsDto,
  ) {
    return this.aiService.generateInterviewQuestions(
      user.sub,
      applicationId,
      dto.questionCount,
    );
  }

  @Post('applications/:id/resume-improvements')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI suggestions for resume improvements' })
  suggestResumeImprovements(
    @CurrentUser() user: JwtPayload,
    @Param('id') applicationId: string,
  ) {
    return this.aiService.suggestResumeImprovements(user.sub, applicationId);
  }

  @Post('summarize-job')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Summarize a job description using AI' })
  summarizeJob(
    @CurrentUser() user: JwtPayload,
    @Body() dto: JobSummaryDto,
  ) {
    return this.aiService.summarizeJobDescription(user.sub, dto.jobDescription);
  }
}
