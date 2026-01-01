import { IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Filter by admin status',
    example: true 
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  admin?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by roles',
    example: ['admin', 'user'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ 
    description: 'Filter by users with reports',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasReports?: boolean;
}
