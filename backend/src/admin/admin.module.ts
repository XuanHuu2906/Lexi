import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminAuditController } from './admin-audit.controller';
import { AdminScenariosController } from './admin-scenarios.controller';
import { AdminScenariosService } from './admin-scenarios.service';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminWordsController } from './admin-words.controller';
import { AdminWordsService } from './admin-words.service';
import { AuditService } from './audit.service';

/**
 * Admin area (UCA01–UCA08): TOEIC word list, conversation scenarios, user
 * moderation, and the audit trail. Every route is gated by RolesGuard on
 * @Roles(ADMIN); every write goes through AuditService.
 */
@Module({
  controllers: [
    AdminStatsController,
    AdminWordsController,
    AdminScenariosController,
    AdminUsersController,
    AdminAuditController,
  ],
  providers: [
    RolesGuard,
    AuditService,
    AdminStatsService,
    AdminWordsService,
    AdminScenariosService,
    AdminUsersService,
  ],
})
export class AdminModule {}
