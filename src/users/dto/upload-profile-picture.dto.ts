import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePictureDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture (JPEG, PNG, GIF, WebP - max 5MB)',
  })
  profile: any;
}