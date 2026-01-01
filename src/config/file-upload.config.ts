import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export const fileUploadConfig = {
  // File size limit (5MB)
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },

  // Allowed file types
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        ),
        false,
      );
    }
  },

  // Storage configuration
  storage: diskStorage({
    destination: (req: any, file: any, callback: any) => {
      // Determine folder based on field name
      const folder = file.fieldname === 'profile' ? 'uploads/profiles' : 'uploads/reports';
      callback(null, folder);
    },
    filename: (req: any, file: any, callback: any) => {
      // Generate unique filename: uuid-timestamp.ext
      const uniqueName = `${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
};

// Image optimization settings
export const imageOptimizationConfig = {
  profile: {
    width: 300,
    height: 300,
    fit: 'cover' as const,
    quality: 80,
  },
  report: {
    width: 1200,
    height: 1200,
    fit: 'inside' as const,
    quality: 85,
  },
};
