import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';  // ✅ Add this import
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SigninDto } from '../users/dto/signin.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })  // 5 requests per minute
  @ApiOperation({ summary: 'Create a new user account' })
  async signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body.email, body.password);
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })  // 5 requests per minute
  @ApiOperation({ summary: 'Sign in to existing account' })
  async signin(@Body() body: SigninDto) {
    return this.authService.signin(body.email, body.password);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 3, ttl: 60000 } })  // 3 requests per minute (stricter)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('logout')
  @SkipThrottle()  //No rate limit (authenticated, safe)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @SkipThrottle()  // No rate limit (authenticated, safe)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      roles: req.user.roles,
    };
  }

  @Post('request-password-reset')
  @Throttle({ default: { limit: 3, ttl: 300000 } })  // 3 requests per 5 minutes (very strict!)
  @ApiOperation({ summary: 'Request password reset link via email' })
  async requestPasswordReset(@Body() body: RequestResetDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })  //3 requests per minute
  @ApiOperation({ summary: 'Reset password using token received via email' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}