import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ManageTagsDto {
  @ApiProperty({ 
    example: ['excellent-condition', 'single-owner'],
    description: 'Array of tag names to add or remove'
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}