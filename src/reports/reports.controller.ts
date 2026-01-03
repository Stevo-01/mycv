import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Patch, 
  Param, 
  Get, 
  Query,
  Delete,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  ForbiddenException,
  Logger,
  Req,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../guards/auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { reportDTO } from './dtos/report.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { AdminGuard } from '../guards/admin.guard';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { ManageTagsDto } from './dtos/manage-tags.dto';
import { SearchReportDto } from './dtos/search-report.dto';
import { fileUploadConfig } from '../config/file-upload.config';
import { FileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { FileUploadUtil } from '../common/utils/file-upload.util';
import { UploadReportImageDto } from './dtos/upload-report-image.dto';


@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private reportsService: ReportsService) {}

  /**
   * Advanced search endpoint
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Search reports with full-text search and filters',
    description: 'Search across make, model, and tags. Supports filtering by year, price, approval status, and more.'
  })
  @ApiResponse({ status: 200, description: 'Returns paginated search results' })
  searchReports(@Query() searchDto: SearchReportDto) {
    return this.reportsService.search(searchDto);
  }

  /**
   * To get price estimate
   */
  @Get('estimate')
  @ApiOperation({ summary: 'Get price estimate based on car details' })
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportsService.createEstimate(query);
  }

  /**
   * To get deleted reports (Admin only)
   */
  @Get('deleted')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all soft-deleted reports (Admin only)' })
  getDeletedReports() {
    return this.reportsService.findDeleted();
  }

  /**
   * To get all reports with pagination
   */
  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all reports with pagination',
    description: 'Returns paginated reports with tags and user info'
  })
  getAllReports(@Query() searchDto: SearchReportDto) {
    return this.reportsService.findAll(searchDto);
  }

  /**
   * To get single report by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a report by ID with tags and images' })
  getReport(@Param('id') id: string) {
    return this.reportsService.findOne(parseInt(id));
  }

  // ==========================================
  // IMAGE ENDPOINTS 
  // ==========================================

  /**
   * Upload image to report
   */
  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Upload image to a report',
    description: 'Upload and optimize an image for a report. Only report owner can upload.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadReportImageDto })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image uploaded successfully' },
        image: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            url: { type: 'string', example: '/uploads/reports/abc-123.jpg' },
            filename: { type: 'string', example: 'abc-123.jpg' },
            originalName: { type: 'string', example: 'car-photo.jpg' },
            size: { type: 'number', example: 245678 },
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', fileUploadConfig),
    new FileUploadInterceptor('report'),
  )
  async uploadReportImage(
    @Param('id') id: string,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user; 
    const report = await this.reportsService.findOne(parseInt(id));

    if (!report) {
      await FileUploadUtil.deleteFile(file.path);
      throw new NotFoundException('Report not found');
    }

      // DEBUG LOG
  this.logger.log(`Report user: ${JSON.stringify(report.user)}`);
  this.logger.log(`Current user: ${JSON.stringify(user)}`);

  // CHECK IF REPORT HAS USER
  if (!report.user) {
    await FileUploadUtil.deleteFile(file.path);
    throw new Error('Report has no associated user');
  }

  // Check ownership (only report owner can add images)
  if (report.user.id !== user.id) {
    await FileUploadUtil.deleteFile(file.path);
    throw new ForbiddenException('You can only add images to your own reports');
  }

    // Save image metadata to database
    const fileUrl = FileUploadUtil.getFileUrl(file.filename, 'report');
    const image = await this.reportsService.createImage(
      report.id,
      file.filename,
      fileUrl,
      file.originalname,
      file.size,
      file.mimetype,
    );

    this.logger.log(
      `User ${user.id} uploaded image to report ${report.id}: ${file.filename}`,
    );

    return {
      message: 'Image uploaded successfully',
      image: {
        id: image.id,
        url: image.url,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
      },
    };
  }

  /**
   * Get all images for a report
   */
  @Get(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all images for a report',
    description: 'Returns a list of all images associated with a report'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all images for the report',
    schema: {
      type: 'object',
      properties: {
        reportId: { type: 'number', example: 1 },
        totalImages: { type: 'number', example: 3 },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              url: { type: 'string', example: '/uploads/reports/abc-123.jpg' },
              filename: { type: 'string', example: 'abc-123.jpg' },
              originalName: { type: 'string', example: 'car-photo.jpg' },
              size: { type: 'number', example: 245678 },
              mimeType: { type: 'string', example: 'image/jpeg' },
              createdAt: { type: 'string', example: '2026-01-02T10:30:00Z' },
            },
          },
        },
      },
    },
  })
  async getReportImages(@Param('id') id: string) {
    const report = await this.reportsService.findOne(parseInt(id));

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const images = await this.reportsService.getReportImages(report.id);

    return {
      reportId: report.id,
      totalImages: images.length,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        originalName: img.originalName,
        size: img.size,
        mimeType: img.mimeType,
        createdAt: img.createdAt,
      })),
    };
  }

  /**
   * Delete a report image
   */
  @Delete(':reportId/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete a report image',
    description: 'Delete an image from a report. Only report owner can delete images.'
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image deleted successfully' },
      },
    },
  })
  async deleteReportImage(
    @Param('reportId') reportId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: User,
  ) {
    const image = await this.reportsService.findImageById(parseInt(imageId));

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const report = await this.reportsService.findOne(parseInt(reportId));

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check ownership
    if (report.user.id !== user.id) {
      throw new ForbiddenException(
        'You can only delete images from your own reports',
      );
    }

    // Verify image belongs to this report
    if (image.reportId !== report.id) {
      throw new NotFoundException('Image does not belong to this report');
    }

    // Delete file from filesystem
    const filePath = FileUploadUtil.getFilePath(image.filename, 'report');
    await FileUploadUtil.deleteFile(filePath);

    // Delete from database
    await this.reportsService.deleteImage(image.id);

    this.logger.log(
      `User ${user.id} deleted image ${imageId} from report ${reportId}`,
    );

    return { message: 'Image deleted successfully' };
  }

/**
 * To create report
 */
@Post()
@UseGuards(JwtAuthGuard)  
@Serialize(reportDTO)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a new report with optional tags' })
createReport(@Body() body: CreateReportDto, @Req() req) {  
  const user = req.user;  
  return this.reportsService.create(body, user);
}
  /**
   * To approve/reject report
   */
  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a report (Admin only)' })
  approveReport(
    @Param('id') id: string, 
    @Body() body: ApproveReportDto, 
    @CurrentUser() user: User,
  ) {
    return this.reportsService.changeApproval(id, body.approved, user);
  }

  /**
   * To restore soft-deleted report
   */
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted report (Admin only)' })
  restoreReport(@Param('id') id: string) {
    return this.reportsService.restore(parseInt(id));
  }

  /**
   * Adding tags to report
   */
  @Patch(':id/tags')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add tags to a report' })
  addTags(
    @Param('id') id: string,
    @Body() body: ManageTagsDto
  ) {
    return this.reportsService.addTags(parseInt(id), body.tags);
  }

  /**
   * To remove tags from report
   */
  @Delete(':id/tags')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove tags from a report' })
  removeTags(
    @Param('id') id: string,
    @Body() body: ManageTagsDto
  ) {
    return this.reportsService.removeTags(parseInt(id), body.tags);
  }

  /**
   * To soft delete report
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a report' })
  deleteReport(@Param('id') id: string) {
    return this.reportsService.remove(parseInt(id));
  }
}