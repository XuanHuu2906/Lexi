import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class QuickAddDto {
  @ApiProperty({
    example: 'design: thiết kế',
    description: 'Syntax "term: meaning"',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  text: string;

  @ApiPropertyOptional({ example: 'business' })
  @IsOptional()
  @IsString()
  topic?: string;
}
