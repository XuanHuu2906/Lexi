import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GradeWritingDto {
  @ApiProperty({ description: 'The passage to grade', maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string;
}
