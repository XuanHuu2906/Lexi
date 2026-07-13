import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class StartConversationDto {
  @ApiProperty({ example: 'Ordering food at a restaurant', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  scenario: string;
}

export class ReplyConversationDto {
  @ApiProperty({ example: "I'd like a table for two, please." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
