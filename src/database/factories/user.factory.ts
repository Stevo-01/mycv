import { faker } from '@faker-js/faker';
import { User } from '../../users/user.entity';
import * as bcrypt from 'bcrypt';

export class UserFactory {
  /**
   * Generate a single user
   */
  static async create(overrides?: Partial<User>): Promise<Partial<User>> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('password123', salt);

    return {
      email: faker.internet.email().toLowerCase(),
      password: hashedPassword,
      admin: false,
      roles: ['user'],
      refreshToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      ...overrides,
    };
  }

  /**
   * Generate multiple users
   */
  static async createMany(count: number, overrides?: Partial<User>): Promise<Partial<User>[]> {
    const users: Partial<User>[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }

  /**
   * Create specific test users
   */
  static async createAdmin(): Promise<Partial<User>> {
    return this.create({
      email: 'admin@test.com',
      admin: true,
      roles: ['admin', 'user'],
    });
  }

  static async createRegularUser(email?: string): Promise<Partial<User>> {
    return this.create({
      email: email || 'user@test.com',
      admin: false,
      roles: ['user'],
    });
  }
}