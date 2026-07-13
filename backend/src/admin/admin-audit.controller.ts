import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';
import { ListAuditDto } from './dto/list-audit.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/audit')
export class AdminAuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Audit trail, newest-first, read-only (UCA08)' })
  list(@Query() query: ListAuditDto) {
    return this.audit.list(query);
  }

  @Get('admins')
  @ApiOperation({ summary: 'Distinct admin emails present in the log' })
  admins() {
    return this.audit.admins();
  }
}
