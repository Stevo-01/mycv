import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: 'test300@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword123', minLength: 8, maxLength: 40 })
  @IsString()
  @MinLength(8)  // ✅ For string length
  @MaxLength(40) // ✅ For string length
  password: string;
}