import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ChatTurnDto } from './ask-grammar.dto';

export class AskTutorDto {
  @ApiPropertyOptional({
    type: [ChatTurnDto],
    description: 'Prior conversation turns (client keeps the context)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];

  @ApiProperty({ example: 'Giải thích giúp mình lạm phát là gì?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question: string;
}
