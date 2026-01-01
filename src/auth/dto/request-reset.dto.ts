import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestResetDto {
  @ApiProperty({ 
    description: 'Email address to receive password reset instructions'
  })
  @IsEmail()
  email: string;
}