import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PreviewGrammarDto {
  @ApiProperty({
    example: 'sau danh từ là tính từ',
    description:
      'A short grammar note OR a messy paragraph (e.g. an answer explanation) to extract the rule from',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  rule: string;
}
