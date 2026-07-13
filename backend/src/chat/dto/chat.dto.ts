import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ChatKind } from '../../../generated/prisma/client';

/** Which "Ask Lexi" surface a thread belongs to. */
export class ListChatThreadsDto {
  @ApiProperty({ enum: ChatKind })
  @IsEnum(ChatKind)
  kind: ChatKind;
}

export class CreateChatThreadDto {
  @ApiProperty({ enum: ChatKind })
  @IsEnum(ChatKind)
  kind: ChatKind;

  @ApiProperty({ example: 'Lạm phát là gì?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Client-shaped transcript turns, stored opaquely.',
    type: [Object],
  })
  @IsArray()
  @ArrayMaxSize(200)
  messages: unknown[];
}

export class UpdateChatThreadDto {
  @ApiPropertyOptional({ example: 'Lạm phát là gì?' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ description: 'Full replacement transcript.', type: [Object] })
  @IsArray()
  @ArrayMaxSize(200)
  messages: unknown[];
}
