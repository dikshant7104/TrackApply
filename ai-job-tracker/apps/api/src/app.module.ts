import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { ResumesModule } from './resumes/resumes.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InterviewPrepModule } from './interview-prep/interview-prep.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { configValidationSchema } from './config/config.validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: configValidationSchema,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    // Background jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    PrismaModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ResumesModule,
    AiModule,
    AnalyticsModule,
    InterviewPrepModule,
  ],
})
export class AppModule {}
