import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { createMockRepository } from '../../test/setup';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const email = 'test@example.com';
      const password = 'hashedPassword';
      const roles = ['user'];

      const mockUser = {
        id: 1,
        email,
        password,
        roles,
        admin: false,
      };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(email, password, roles);

      expect(mockRepository.create).toHaveBeenCalledWith({ email, password, roles });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: false,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if id is not provided', async () => {
      const result = await service.findOne(null);
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('should return users by email', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com' },
        { id: 2, email: 'test@example.com' },
      ];

      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.find('test@example.com');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'oldPassword',
      };

      const updatedUser = {
        ...mockUser,
        password: 'newPassword',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, { password: 'newPassword' });

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.password).toBe('newPassword');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { password: 'newPassword' }))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.softRemove.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockUser);
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted user', async () => {
      const mockDeletedUser = {
        id: 1,
        email: 'test@example.com',
        deletedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockDeletedUser);
      mockRepository.recover.mockResolvedValue({
        ...mockDeletedUser,
        deletedAt: null,
      });

      const result = await service.restore(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(mockRepository.recover).toHaveBeenCalledWith(mockDeletedUser);
      expect(result.deletedAt).toBeNull();
    });

    it('should throw NotFoundException if user is not deleted', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        deletedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.restore(1))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // ✅ FIXED SECTION
  describe('findAll with pagination', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter by search query', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'john',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should exclude deleted users by default', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        includeDeleted: false,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.deletedAt IS NULL',
      );
    });
  });
});
