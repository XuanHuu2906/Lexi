import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CefrLevel } from '../../../generated/prisma/client';

export class LookupDto {
  @ApiProperty({ example: 'serendipity' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  term: string;

  @ApiPropertyOptional({
    enum: CefrLevel,
    description: 'Learner level for tailoring the explanation',
  })
  @IsOptional()
  @IsEnum(CefrLevel)
  level?: CefrLevel;
}
