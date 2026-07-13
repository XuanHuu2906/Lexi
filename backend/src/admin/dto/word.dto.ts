import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAdminWordDto {
  @ApiProperty({ description: 'English word (surface form)' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  word!: string;

  @ApiProperty({ description: 'Suggested Vietnamese meaning' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  meaning!: string;

  @ApiPropertyOptional({ description: 'Theme/group, e.g. "Tài chính"' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  group?: string;
}

export class UpdateAdminWordDto extends PartialType(CreateAdminWordDto) {}

export class ListAdminWordsDto {
  @ApiPropertyOptional({ description: 'Search word or meaning' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ImportWordsDto {
  @ApiProperty({ description: 'CSV text; each line "word;meaning;group"' })
  @IsString()
  @MaxLength(100_000)
  text!: string;

  @ApiPropertyOptional({
    description: 'When false, only parse + report; do not persist.',
    default: true,
  })
  @IsOptional()
  commit?: boolean;
}
