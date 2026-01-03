import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { Logger } from '@nestjs/common';
import { imageOptimizationConfig } from '../../config/file-upload.config';

const logger = new Logger('FileUploadUtil');

export class FileUploadUtil {
  /**
   * To Ensuring upload directories exist
   */
  static async ensureUploadDirectories(): Promise<void> {
    const directories = ['uploads/profiles', 'uploads/reports'];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        logger.log(`Created/verified directory: ${dir}`);
      } catch (error) {
        logger.error(`Failed to create directory ${dir}:`, error);
        throw error;
      }
    }
  }

  /**
   * Optimize and resize image
   */
  static async optimizeImage(
    filePath: string,
    type: 'profile' | 'report',
  ): Promise<void> {
    try {
      const config = imageOptimizationConfig[type];
      const tempPath = `${filePath}.temp`;

      await sharp(filePath)
        .resize(config.width, config.height, { fit: config.fit })
        .jpeg({ quality: config.quality })
        .png({ quality: config.quality })
        .webp({ quality: config.quality })
        .toFile(tempPath);

      // Replace original with optimized
      await fs.unlink(filePath);
      await fs.rename(tempPath, filePath);

      logger.log(`Optimized image: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to optimize image ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Delete file from filesystem
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.log(`Deleted file: ${filePath}`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        logger.error(`Failed to delete file ${filePath}:`, error);
        throw error;
      }
      // File doesn't exist, ignore
    }
  }

  /**
   * Get file URL
   */
  static getFileUrl(filename: string, type: 'profile' | 'report'): string {
    const folder = type === 'profile' ? 'profiles' : 'reports';
    return `/uploads/${folder}/${filename}`;
  }

  /**
   * Extract filename from URL
   */
  static getFilenameFromUrl(url: string): string | null {
    const match = url.match(/\/uploads\/(profiles|reports)\/(.+)$/);
    return match ? match[2] : null;
  }

  /**
   * Get full file path
   */
  static getFilePath(filename: string, type: 'profile' | 'report'): string {
    const folder = type === 'profile' ? 'profiles' : 'reports';
    return path.join('uploads', folder, filename);
  }

  /**
   * Validate file exists
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}