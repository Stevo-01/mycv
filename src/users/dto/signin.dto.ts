// src/user/dto/signin.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SigninDto {
  @ApiProperty({ example: 'test300@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword123', minLength: 4, maxLength: 40 })
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  password: string;
}
