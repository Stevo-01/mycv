import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Password reset token received via email'
  })
  @IsString()
  token: string;

  @ApiProperty({ 
    description: 'New password for the account',
    minLength: 8,
    maxLength: 40
  })
  @IsString()
  @MinLength(8)
  @MaxLength(40)
  newPassword: string;
}