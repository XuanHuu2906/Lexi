import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ description: 'Current account password; never logged' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;

  @ApiProperty({ enum: ['DELETE'] })
  @Equals('DELETE')
  confirmation: string;
}
