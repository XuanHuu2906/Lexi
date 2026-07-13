import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ReviewRating {
  FORGOT = 'forgot',
  HARD = 'hard',
  GOOD = 'good',
  EASY = 'easy',
}

/** Map the user-facing rating to an SM-2 quality score (0–5). */
export const RATING_QUALITY: Record<ReviewRating, number> = {
  [ReviewRating.FORGOT]: 0,
  [ReviewRating.HARD]: 3,
  [ReviewRating.GOOD]: 4,
  [ReviewRating.EASY]: 5,
};

export class AnswerDto {
  @ApiProperty({ description: 'Id of the reviewed word' })
  @IsString()
  @IsNotEmpty()
  wordId: string;

  @ApiProperty({ enum: ReviewRating })
  @IsEnum(ReviewRating)
  rating: ReviewRating;
}
