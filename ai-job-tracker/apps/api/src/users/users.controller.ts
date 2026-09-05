import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, UpdateProfileDto, ChangePasswordDto } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account' })
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.usersService.deleteAccount(user.sub);
  }
}
