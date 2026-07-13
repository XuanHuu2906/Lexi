import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const FLASHCARD_MODES = ['guess', 'listen', 'fill', 'match'] as const;
export type FlashcardMode = (typeof FLASHCARD_MODES)[number];

export const FLASHCARD_SCOPES = ['due', 'today'] as const;
export type FlashcardScope = (typeof FLASHCARD_SCOPES)[number];

export class FlashcardsDto {
  @ApiPropertyOptional({
    enum: FLASHCARD_MODES,
    default: 'guess',
    description:
      'guess = see word, pick meaning; listen = hear word, pick meaning; fill = cloze; match = pair up',
  })
  @IsOptional()
  @IsIn(FLASHCARD_MODES)
  mode?: FlashcardMode;

  @ApiPropertyOptional({
    enum: FLASHCARD_SCOPES,
    default: 'due',
    description:
      'due = spaced-repetition deck (due-first); today = words added today (falls back to due when none)',
  })
  @IsOptional()
  @IsIn(FLASHCARD_SCOPES)
  scope?: FlashcardScope;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
