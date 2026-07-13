import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Cefr = (typeof CEFR)[number];

export class AnalyzeContextDto {
  @ApiProperty({
    description: 'The passage to analyse (article, lyrics, email…)',
    maxLength: 4000,
    example:
      'Yesterday the board approved an ambitious plan to deploy new software.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  passage: string;

  @ApiPropertyOptional({
    enum: CEFR,
    description: "Learner CEFR level; tunes difficulty (defaults to 'B1').",
  })
  @IsOptional()
  @IsIn(CEFR)
  level?: Cefr;
}
