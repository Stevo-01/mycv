import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsLongitude,
  IsLatitude,
  IsArray,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2020, minimum: 1930, maximum: 2050 })
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  @ApiProperty({ example: 50000, minimum: 0, maximum: 1000000 })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @ApiProperty({ example: -118.2437 })
  @IsLongitude()
  lng: number;

  @ApiProperty({ example: 34.0522 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 25000, minimum: 0, maximum: 1000000 })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;

  // Adding tags support
  @ApiPropertyOptional({ 
    example: ['sedan', 'low-mileage', 'clean-title'],
    description: 'Tags for the report',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}