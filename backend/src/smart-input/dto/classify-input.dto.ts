import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ClassifyInputDto {
  @ApiProperty({
    example: 'design: thiết kế',
    description:
      'Free text — vocabulary ("term: meaning"), a grammar rule, or a messy paragraph to extract a rule from',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text: string;
}
