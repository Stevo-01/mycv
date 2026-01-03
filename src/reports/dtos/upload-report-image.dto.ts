import { ApiProperty } from '@nestjs/swagger';

export class UploadReportImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Report image (JPEG, PNG, GIF, WebP - max 5MB)',
  })
  image: any;
}