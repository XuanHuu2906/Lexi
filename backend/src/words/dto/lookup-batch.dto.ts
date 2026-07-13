import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CefrLevel } from '../../../generated/prisma/client';

export class LookupBatchDto {
  @ApiProperty({
    example: '(A) infinitely (B) sincerely (C) precisely (D) greatly',
    description:
      'Raw text with one or more words; option labels like "(A)" are stripped',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiPropertyOptional({
    enum: CefrLevel,
    description: 'Learner level for tailoring the explanation',
  })
  @IsOptional()
  @IsEnum(CefrLevel)
  level?: CefrLevel;
}
