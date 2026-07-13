import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWordDto {
  @ApiProperty({ example: 'serendipity' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  term: string;

  @ApiProperty({ example: 'sự tình cờ may mắn' })
  @IsString()
  @IsNotEmpty()
  meaning: string;

  @ApiPropertyOptional({ example: '/ˌserənˈdɪpəti/' })
  @IsOptional()
  @IsString()
  phonetic?: string;

  @ApiPropertyOptional({ example: 'noun' })
  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  antonyms?: string[];

  @ApiPropertyOptional({ example: 'business' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
