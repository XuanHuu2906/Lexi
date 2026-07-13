import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const STATS_PERIODS = ['week', 'month', 'all'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];

export class StatsQueryDto {
  @ApiPropertyOptional({ enum: STATS_PERIODS, default: 'all' })
  @IsOptional()
  @IsIn(STATS_PERIODS)
  period?: StatsPeriod;
}
