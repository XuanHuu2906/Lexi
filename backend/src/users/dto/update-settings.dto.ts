import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CefrLevel, TtsVoice } from '../../../generated/prisma/client';
import { IsValidTimeZone } from '../../common/validators/is-valid-timezone';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 500, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  dailyGoal?: number;

  @ApiPropertyOptional({ enum: CefrLevel })
  @IsOptional()
  @IsEnum(CefrLevel)
  cefrLevel?: CefrLevel;

  @ApiPropertyOptional({ type: [String], example: ['business', 'travel'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiPropertyOptional({
    example: '20:00',
    description: "HH:mm in the user's timeZone",
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'reminderTime must be in HH:mm format',
  })
  reminderTime?: string;

  @ApiPropertyOptional({
    example: 'Asia/Ho_Chi_Minh',
    description: 'IANA timezone that reminderTime is interpreted in',
  })
  @IsOptional()
  @IsString()
  @IsValidTimeZone({ message: 'timeZone must be a valid IANA timezone' })
  timeZone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifyEnabled?: boolean;

  @ApiPropertyOptional({ enum: TtsVoice })
  @IsOptional()
  @IsEnum(TtsVoice)
  ttsVoice?: TtsVoice;
}
