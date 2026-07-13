import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CefrLevel } from '../../../generated/prisma/client';

export class GenerateDictationDto {
  @ApiPropertyOptional({
    enum: CefrLevel,
    description: 'Learner level; defaults to B1 when omitted',
  })
  @IsOptional()
  @IsEnum(CefrLevel)
  level?: CefrLevel;

  @ApiPropertyOptional({
    description: 'Number of sentences to generate',
    minimum: 1,
    maximum: 20,
    default: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  count?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Preferred topics for the sentences',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  topics?: string[];
}
