import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
  Req,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { PaginatedUserResponseDto } from './dto/paginated-user.dto';
import { fileUploadConfig } from '../config/file-upload.config';
import { FileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { FileUploadUtil } from '../common/utils/file-upload.util';
import { UploadProfilePictureDto } from './dto/upload-profile-picture.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  /**
   * To get current authenticated user
   */
  @Get('/whoami')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Get current authenticated user' })
  whoAmI(@Req() req) {
    return req.user;
  }

  /**
   * To get all users with pagination (admin only)
   * NOTE: This must come BEFORE /:id route to avoid conflicts
   */
  @Get('/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and filtering (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated users',
    type: PaginatedResponseDto
  })
  findAllUsersPaginated(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  /**
   * To get soft-deleted users (admin only)
   */
  @Get('/deleted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Get all soft-deleted users (Admin only)' })
  findDeletedUsers() {
    return this.usersService.findDeleted();
  }

  // ==========================================
  // FILE UPLOAD ENDPOINTS
  // ==========================================

  /**
   * Upload profile picture for current user
   */
  @Post('/me/profile-picture')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile picture for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadProfilePictureDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Profile picture uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        profilePicture: { type: 'string' }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('profile', fileUploadConfig),
    new FileUploadInterceptor('profile'),
  )
  async uploadProfilePicture(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user as User;

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldFilename = FileUploadUtil.getFilenameFromUrl(user.profilePicture);
      if (oldFilename) {
        const oldPath = FileUploadUtil.getFilePath(oldFilename, 'profile');
        await FileUploadUtil.deleteFile(oldPath);
      }
    }

    // Update user with new profile picture URL
    const fileUrl = FileUploadUtil.getFileUrl(file.filename, 'profile');
    user.profilePicture = fileUrl;
    await this.usersService.save(user);

    this.logger.log(`User ${user.id} uploaded profile picture: ${file.filename}`);

    return {
      message: 'Profile picture uploaded successfully',
      profilePicture: fileUrl,
    };
  }

  /**
   * Delete profile picture for current user
   */
  @Delete('/me/profile-picture')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete profile picture for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile picture deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async deleteProfilePicture(@Req() req) {
    const user = req.user as User;

    if (!user.profilePicture) {
      return { message: 'No profile picture to delete' };
    }

    // Delete file from filesystem
    const filename = FileUploadUtil.getFilenameFromUrl(user.profilePicture);
    if (filename) {
      const filePath = FileUploadUtil.getFilePath(filename, 'profile');
      await FileUploadUtil.deleteFile(filePath);
    }

    // Update user
    user.profilePicture = "";
    await this.usersService.save(user);

    this.logger.log(`User ${user.id} deleted profile picture`);

    return { message: 'Profile picture deleted successfully' };
  }

  // ==========================================
  // EXISTING ENDPOINTS CONTINUE BELOW
  // ==========================================

  /**
   * To get user by ID
   */
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Get user by ID' })
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  /**
   * To find users by email (kept for backward compatibility)
   * This is now more of a search endpoint
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Find users by email' })
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  /**
   * To update user
   */
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Update user details' })
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }

  /**
   * To restore soft-deleted user (admin only)
   */
  @Patch('/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Restore a soft-deleted user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  restoreUser(@Param('id') id: string) {
    return this.usersService.restore(parseInt(id));
  }

  /**
   * To soft delete user (default behavior)
   */
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  /**
   * Permanently delete user (admin only)
   */
  @Delete('/:id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Serialize(UserDto)
  @ApiOperation({ 
    summary: 'Permanently delete a user (Admin only - CANNOT BE UNDONE)',
    description: 'This permanently removes the user from the database. Use with caution!'
  })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  removePermanently(@Param('id') id: string) {
    return this.usersService.removePermananently(parseInt(id));
  }
}