import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary(userId: string) {
    const [applications, upcomingInterviews] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          company: true,
          jobTitle: true,
          createdAt: true,
          interviewAt: true,
          appliedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobApplication.findMany({
        where: {
          userId,
          status: ApplicationStatus.INTERVIEW,
          interviewAt: { gte: new Date() },
        },
        orderBy: { interviewAt: 'asc' },
        take: 5,
      }),
    ]);

    const total = applications.length;
    const byStatus = this.countByStatus(applications);

    const applied = byStatus[ApplicationStatus.APPLIED] || 0;
    const interviews = byStatus[ApplicationStatus.INTERVIEW] || 0;
    const offers = byStatus[ApplicationStatus.OFFER] || 0;
    const rejected = byStatus[ApplicationStatus.REJECTED] || 0;
    const totalClosed = applied + interviews + offers + rejected;

    const interviewConversionRate = totalClosed > 0
      ? Math.round(((interviews + offers) / totalClosed) * 100)
      : 0;

    const offerRate = totalClosed > 0
      ? Math.round((offers / totalClosed) * 100)
      : 0;

    const rejectionRate = totalClosed > 0
      ? Math.round((rejected / totalClosed) * 100)
      : 0;

    const weeklyTrend = this.getWeeklyTrend(applications);

    return {
      total,
      byStatus,
      interviewConversionRate,
      offerRate,
      rejectionRate,
      weeklyTrend,
      upcomingInterviews,
    };
  }

  async getStatusBreakdown(userId: string) {
    const counts = await this.prisma.jobApplication.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    return counts.map((c) => ({
      status: c.status,
      count: c._count.status,
    }));
  }

  async getMonthlyTrend(userId: string) {
    const twelveWeeksAgo = subWeeks(new Date(), 12);

    const applications = await this.prisma.jobApplication.findMany({
      where: {
        userId,
        createdAt: { gte: twelveWeeksAgo },
      },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    return this.getWeeklyTrend(applications);
  }

  private countByStatus(applications: Array<{ status: ApplicationStatus }>) {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);
  }

  private getWeeklyTrend(applications: Array<{ createdAt: Date }>) {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i));
      const weekEnd = endOfWeek(weekStart);
      const count = applications.filter(
        (app) => app.createdAt >= weekStart && app.createdAt <= weekEnd,
      ).length;

      weeks.push({
        week: format(weekStart, 'MMM d'),
        count,
      });
    }
    return weeks;
  }
}
