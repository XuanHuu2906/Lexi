import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ExplainDictationDto {
  @ApiProperty({ description: 'The correct sentence', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reference: string;

  @ApiProperty({ description: 'What the learner typed', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  attempt: string;
}
