import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CefrLevel } from '../../../generated/prisma/client';

export class VerifyWordDto {
  @ApiProperty({ example: 'solicit' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  term: string;

  @ApiPropertyOptional({
    example: 'thu thập',
    description: 'The Vietnamese meaning the learner typed, to be validated',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  meaning?: string;

  @ApiPropertyOptional({
    enum: CefrLevel,
    description: 'Learner level for tailoring the explanation',
  })
  @IsOptional()
  @IsEnum(CefrLevel)
  level?: CefrLevel;
}
