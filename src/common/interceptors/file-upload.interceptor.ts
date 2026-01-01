import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FileUploadUtil } from '../utils/file-upload.util';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private readonly imageType: 'profile' | 'report') {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Optimize image after upload
    try {
      await FileUploadUtil.optimizeImage(file.path, this.imageType);
    } catch (error) {
      // Delete the file if optimization fails
      await FileUploadUtil.deleteFile(file.path);
      throw new BadRequestException('Failed to process image');
    }

    return next.handle().pipe(
      tap({
        error: async () => {
          // Delete file if request fails
          await FileUploadUtil.deleteFile(file.path);
        },
      }),
    );
  }
}
