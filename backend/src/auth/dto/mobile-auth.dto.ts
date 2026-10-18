import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class MobileLoginDto {
  @ApiProperty({ example: 'learner@example.invalid', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ minLength: 1, maxLength: 72, writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}

export class MobileRegisterDto extends MobileLoginDto {
  @ApiProperty({ minLength: 8, maxLength: 72, writeOnly: true })
  @MinLength(8)
  @IsByteLength(8, 72)
  declare password: string;
}

export class MobileRefreshDto {
  @ApiProperty({
    description: 'Opaque refresh credential (64 lowercase hex characters)',
    writeOnly: true,
  })
  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  refreshToken: string;
}
