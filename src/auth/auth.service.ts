import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private dataSource: DataSource, 
  ) {}

  /** 
   * Sign up a new user with transaction
   * Ensures user creation and token generation are atomic
   */
  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email already in use');
    }

    // Use transaction to ensure atomic operation
    return await this.dataSource.transaction(async (manager) => {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user within transaction
      const userRepo = manager.getRepository(User);
      const user = userRepo.create({ 
        email, 
        password: hashedPassword, 
        roles: ['user'] 
      });
      await userRepo.save(user);

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email);
      
      // Update refresh token within same transaction
      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      user.refreshToken = hashedRefreshToken;
      await userRepo.save(user);

      return {
        user: { id: user.id, email: user.email, roles: user.roles },
        ...tokens,
      };
    });
  }

  /** Sign in existing user */
  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, roles: user.roles },
      ...tokens,
    };
  }

  /** Generate access and refresh tokens */
  async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this',
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /** Store hashed refresh token */
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshToken: hashed });
  }

  /** Refresh JWT tokens */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this',
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /** Logout: invalidate refresh token */
  async logout(userId: number) {
    await this.usersService.update(userId, { refreshToken: null });
  }

  /** Request a password reset */
  async requestPasswordReset(email: string) {
    const [user] = await this.usersService.find(email);
    if (!user) return { message: 'If an account exists, a reset link has been sent.' };
  
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
  
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
  
    await this.usersService.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    });
  
    await this.emailService.sendPasswordResetEmail(email, token);
  
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  /** 
   * Reset password with transaction
   * Ensures password update and token cleanup are atomic
   */
  async resetPassword(token: string, newPassword: string) {
    // Use transaction for atomic password reset
    return await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      
      // Get all users to check token (because tokens are hashed)
      const result = await this.usersService.findAll();
      const users = result.data;

      let matchedUser: User | null = null;

      // Find user with matching token
      for (const user of users) {
        if (user.resetPasswordToken) {
          const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
          if (isTokenValid) {
            matchedUser = user;
            break;
          }
        }
      }

      if (!matchedUser) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Check if token expired
      if (!matchedUser.resetPasswordExpires || new Date() > matchedUser.resetPasswordExpires) {
        throw new BadRequestException('Reset token has expired. Please request a new one.');
      }

      // Hash new password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset fields within transaction
      matchedUser.password = hashedPassword;
      matchedUser.resetPasswordToken = null;
      matchedUser.resetPasswordExpires = null;
      
      await userRepo.save(matchedUser);

      return { 
        message: 'Password has been successfully reset. You can now sign in with your new password.' 
      };
    });
  }
} 