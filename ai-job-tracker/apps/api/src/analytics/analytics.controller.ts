import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics summary' })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getDashboardSummary(user.sub);
  }

  @Get('status-breakdown')
  @ApiOperation({ summary: 'Get application count by status' })
  getStatusBreakdown(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getStatusBreakdown(user.sub);
  }

  @Get('monthly-trend')
  @ApiOperation({ summary: 'Get weekly application trend over 8 weeks' })
  getMonthlyTrend(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getMonthlyTrend(user.sub);
  }
}
