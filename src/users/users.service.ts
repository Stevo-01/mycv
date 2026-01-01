import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  
  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  create(email: string, password: string, roles: string[]) {
    const user = this.repo.create({ email, password, roles });
    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) return null;
    return this.repo.findOne({ 
      where: { id },
      withDeleted: false  // Exclude soft-deleted by default
    });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  /**
   * To get all users with pagination and filtering
   */
  async findAll(paginationDto?: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC',
      search,
      includeDeleted = false
    } = paginationDto || {};

    const queryBuilder = this.repo.createQueryBuilder('user');

    // Handle soft delete
    if (!includeDeleted) {
      queryBuilder.where('user.deletedAt IS NULL');
    }

    // Search functionality (email or roles)
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR CAST(user.roles AS TEXT) ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('user not found');
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  /**
   * To soft delete by default
   */
  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('user not found');
    
    // Soft delete (sets deletedAt timestamp)
    return this.repo.softRemove(user);
  }

  /**
   * To hard delete (permanent removal)
   */
  async removePermananently(id: number): Promise<User> {
    const user = await this.repo.findOne({ 
      where: { id },
      withDeleted: true  // Include soft-deleted records
    });
    if (!user) throw new NotFoundException('user not found');
    
    return this.repo.remove(user);
  }

  /**
   * To estore soft-deleted user
   */
  async restore(id: number): Promise<User> {
    const user = await this.repo.findOne({ 
      where: { id },
      withDeleted: true
    });
    
    if (!user) throw new NotFoundException('user not found');
    if (!user.deletedAt) {
      throw new NotFoundException('user is not deleted');
    }

    return this.repo.recover(user);
  }

  /**
   * To find soft-deleted users only
   */
  async findDeleted(): Promise<User[]> {
    return this.repo
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.deletedAt IS NOT NULL')
      .getMany();
  }

}
