import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController, GamificationController],
  providers: [StatsService, GamificationService],
  exports: [GamificationService],
})
export class ProgressModule {}
