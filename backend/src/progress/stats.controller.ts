import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Learning statistics overview (UC16)' })
  overview(
    @CurrentUser('userId') userId: string,
    @Query() query: StatsQueryDto,
  ) {
    return this.statsService.overview(userId, query.period);
  }

  @Get('weakness')
  @ApiOperation({ summary: 'Weakest topics and most-forgotten words (UC16)' })
  weakness(@CurrentUser('userId') userId: string) {
    return this.statsService.weakness(userId);
  }
}
