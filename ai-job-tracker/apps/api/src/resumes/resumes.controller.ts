import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('resumes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'resumes', version: '1' })
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a resume (PDF or Word)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.resumesService.upload(user.sub, file);
  }

  @Get()
  @ApiOperation({ summary: 'List all user resumes' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.resumesService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resume by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.findOne(user.sub, id);
  }

  @Put(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a resume as the default' })
  setDefault(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.setDefault(user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a resume' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.remove(user.sub, id);
  }
}
