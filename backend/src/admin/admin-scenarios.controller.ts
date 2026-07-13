import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { AdminScenariosService } from './admin-scenarios.service';
import { auditActor as actor } from './audit.service';
import {
  CreateScenarioDto,
  ListScenariosDto,
  UpdateScenarioDto,
} from './dto/scenario.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/scenarios')
export class AdminScenariosController {
  constructor(private readonly scenarios: AdminScenariosService) {}

  @Get()
  @ApiOperation({ summary: 'List conversation scenarios (UCA04)' })
  list(@Query() query: ListScenariosDto) {
    return this.scenarios.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a scenario' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateScenarioDto) {
    return this.scenarios.create(actor(user), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a scenario' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateScenarioDto,
  ) {
    return this.scenarios.update(actor(user), id, dto);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Show/hide a scenario for learners' })
  toggle(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.scenarios.toggle(actor(user), id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a scenario (starts hidden)' })
  duplicate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.scenarios.duplicate(actor(user), id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scenario' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.scenarios.remove(actor(user), id);
  }
}
