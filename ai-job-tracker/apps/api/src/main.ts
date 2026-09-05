import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  // Security
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  });

  // Global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Job Tracker API')
      .setDescription('Production-grade AI-powered job application tracking SaaS API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('applications', 'Job application CRUD')
      .addTag('resumes', 'Resume management')
      .addTag('ai', 'AI-powered features')
      .addTag('analytics', 'Dashboard analytics')
      .addTag('interview-prep', 'Interview preparation')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}/api/v1`);
}

bootstrap();
