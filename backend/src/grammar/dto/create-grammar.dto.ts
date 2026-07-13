import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGrammarDto {
  @ApiPropertyOptional({ example: 'Trật tự tính từ và danh từ' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ example: 'adj + noun' })
  @IsString()
  @IsNotEmpty()
  formula: string;

  @ApiProperty({ example: 'Trong tiếng Anh, tính từ đứng trước danh từ.' })
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['a red car — một chiếc xe màu đỏ'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];
}
