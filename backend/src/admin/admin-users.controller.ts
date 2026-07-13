import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/jwt-payload.type';
import { AdminUsersService } from './admin-users.service';
import { auditActor as actor } from './audit.service';
import { ListAdminUsersDto, LockUserDto } from './dto/user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users (non-sensitive metadata only, UCA05)' })
  list(@Query() query: ListAdminUsersDto) {
    return this.users.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'User metadata detail' })
  getOne(@Param('id') id: string) {
    return this.users.getOne(id);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Lock an account with a required reason (UCA06)' })
  lock(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: LockUserDto,
  ) {
    return this.users.lock(actor(user), id, dto.reason);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock an account with a required reason' })
  unlock(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: LockUserDto,
  ) {
    return this.users.unlock(actor(user), id, dto.reason);
  }
}
