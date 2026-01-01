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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
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
  @ApiOperation({ summary: 'Get a report by ID with tags' })
  getReport(@Param('id') id: string) {
    return this.reportsService.findOne(parseInt(id));
  }

  /**
   * To create report
   */
  @Post()
  @UseGuards(AuthGuard)
  @Serialize(reportDTO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new report with optional tags' })
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
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
