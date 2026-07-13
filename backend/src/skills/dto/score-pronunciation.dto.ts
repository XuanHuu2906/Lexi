import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ScorePronunciationDto {
  @ApiProperty({ description: 'The sentence the learner was asked to read' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  referenceText: string;

  @ApiProperty({
    required: false,
    description:
      'Fallback text recognised from the learner speech (front-end Web Speech API). ' +
      'Only used when no `audio` file is uploaded / Azure is unavailable.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recognizedText?: string;
}
