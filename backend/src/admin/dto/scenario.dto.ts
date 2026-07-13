import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ScenarioDifficulty } from '../../../generated/prisma/client';

export class CreateScenarioDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  description!: string;

  @ApiProperty({ description: 'Opening role/context hint for the AI' })
  @IsString()
  @MaxLength(1000)
  roleHint!: string;

  @ApiProperty({ enum: ScenarioDifficulty })
  @IsEnum(ScenarioDifficulty)
  difficulty!: ScenarioDifficulty;
}

export class UpdateScenarioDto extends PartialType(CreateScenarioDto) {}

export class ListScenariosDto {
  @ApiPropertyOptional({ description: 'Search name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ScenarioDifficulty })
  @IsOptional()
  @IsEnum(ScenarioDifficulty)
  difficulty?: ScenarioDifficulty;

  @ApiPropertyOptional({ enum: ['on', 'off'], description: 'Visibility filter' })
  @IsOptional()
  @IsIn(['on', 'off'])
  status?: 'on' | 'off';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
