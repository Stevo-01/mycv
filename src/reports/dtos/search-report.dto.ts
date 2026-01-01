import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchReportDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Search query (searches make, model, and tags)',
    example: 'toyota camry'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by make',
    example: 'Toyota'
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by model',
    example: 'Camry'
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ 
    description: 'Minimum year',
    example: 2015,
    minimum: 1930
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1930)
  minYear?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum year',
    example: 2024,
    maximum: 2050
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(2050)
  maxYear?: number;

  @ApiPropertyOptional({ 
    description: 'Minimum price',
    example: 10000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum price',
    example: 50000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by approved status',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  approved?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by tag names (comma-separated)',
    example: 'sedan,low-mileage'
  })
  @IsOptional()
  @IsString()
  tags?: string;
}