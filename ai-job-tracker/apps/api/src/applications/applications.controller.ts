import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationQueryDto,
} from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('applications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'applications', version: '1' })
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job applications with filtering and pagination' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.applicationsService.findAll(user.sub, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  getStats(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.getStats(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.applicationsService.findOne(user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a job application' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job application' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.applicationsService.remove(user.sub, id);
  }
}
