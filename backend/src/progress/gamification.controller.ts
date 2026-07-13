import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@ApiBearerAuth()
@Controller()
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('streak')
  @ApiOperation({ summary: 'Current streak + today progress (UC17)' })
  streak(@CurrentUser('userId') userId: string) {
    return this.gamification.getStreak(userId);
  }

  @Get('badges')
  @ApiOperation({ summary: 'All badges with earned status (UC17)' })
  badges(@CurrentUser('userId') userId: string) {
    return this.gamification.getBadges(userId);
  }
}
