import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GenerateQuizDto {
  @ApiPropertyOptional({ default: 10, minimum: 4, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(20)
  count?: number;
}

export class SubmitQuizDto {
  @ApiProperty({ description: 'Quiz id from /quiz/generate' })
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({
    type: [Number],
    description: 'Chosen option index per question (use -1 for unanswered)',
  })
  @IsArray()
  @IsInt({ each: true })
  answers: number[];
}

export class SaveQuizProgressDto {
  @ApiProperty({
    type: [Number],
    description: 'Chosen option index per question so far',
  })
  @IsArray()
  @IsInt({ each: true })
  answers: number[];
}
