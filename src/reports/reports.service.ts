import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Report } from './report.entity';
import { Tag } from '../tags/tag.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { SearchReportDto } from './dtos/search-report.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { ReportImage } from './entities/report-image.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private repo: Repository<Report>,
    @InjectRepository(Tag) private tagsRepo: Repository<Tag>,
    @InjectRepository(ReportImage)
    private imageRepo: Repository<ReportImage>,
  ) {}

  /**
   * Advanced search with full-text search and filters
   */
  async search(searchDto: SearchReportDto): Promise<PaginatedResponseDto<Report>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      q,
      make,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      approved,
      tags,
      includeDeleted = false,
    } = searchDto;

    const queryBuilder = this.repo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.tags', 'tags');

    if (!includeDeleted) {
      queryBuilder.where('report.deletedAt IS NULL');
    }

    if (q) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where("to_tsvector('english', report.make || ' ' || report.model) @@ plainto_tsquery('english', :query)", { query: q })
            .orWhere('LOWER(report.make) LIKE LOWER(:search)', { search: `%${q}%` })
            .orWhere('LOWER(report.model) LIKE LOWER(:search)', { search: `%${q}%` })
            .orWhere('LOWER(tags.name) LIKE LOWER(:search)', { search: `%${q}%` });
        })
      );
    }

    if (make) {
      queryBuilder.andWhere('LOWER(report.make) = LOWER(:make)', { make });
    }

    if (model) {
      queryBuilder.andWhere('LOWER(report.model) = LOWER(:model)', { model });
    }

    if (minYear) {
      queryBuilder.andWhere('report.year >= :minYear', { minYear });
    }
    if (maxYear) {
      queryBuilder.andWhere('report.year <= :maxYear', { maxYear });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('report.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('report.price <= :maxPrice', { maxPrice });
    }

    if (approved !== undefined) {
      queryBuilder.andWhere('report.approved = :approved', { approved });
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      queryBuilder.andWhere('tags.name IN (:...tagNames)', { tagNames: tagArray });
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'price', 'year', 'mileage', 'make', 'model'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`report.${sortField}`, sortOrder);

    if (sortField !== 'createdAt') {
      queryBuilder.addOrderBy('report.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.repo.createQueryBuilder('report')
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }

  async create(reportDTO: CreateReportDto, user: User): Promise<Report> {
    const { tags, ...reportData } = reportDTO;
    const report = this.repo.create(reportData);
    report.user = user;

    if (tags && tags.length > 0) {
      const tagEntities = await Promise.all(
        tags.map(async (tagName) => {
          let tag = await this.tagsRepo.findOne({ where: { name: tagName } });
          if (!tag) {
            tag = this.tagsRepo.create({ name: tagName });
            await this.tagsRepo.save(tag);
          }
          return tag;
        })
      );
      report.tags = tagEntities;
    }

    return this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean, adminUser: User): Promise<Report> {
    const report = await this.repo.findOne({ where: { id: +id } });
    if (!report) throw new NotFoundException('Report not found');
  
    report.approved = approved;
    report.user = adminUser;
    return this.repo.save(report);
  }

  async findAll(searchDto?: SearchReportDto): Promise<PaginatedResponseDto<Report>> {
    if (searchDto && Object.keys(searchDto).length > 0) {
      return this.search(searchDto);
    }

    const page = 1;
    const limit = 10;
    
    const [data, total] = await this.repo.findAndCount({
      relations: ['user', 'tags'],
      take: limit,
      skip: 0,
      order: { createdAt: 'DESC' }
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: number): Promise<Report> {
    if (!id) {
      throw new NotFoundException('Report not found');
    }
    const report = await this.repo.findOne({ 
      where: { id },
      relations: {
        user: true,
        tags: true,
        images: true,
      }
    });
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    
    return report;
  }

  async addTags(id: number, tagNames: string[]): Promise<Report> {
    const report = await this.findOne(id);
    
    const tagEntities = await Promise.all(
      tagNames.map(async (tagName) => {
        let tag = await this.tagsRepo.findOne({ where: { name: tagName } });
        if (!tag) {
          tag = this.tagsRepo.create({ name: tagName });
          await this.tagsRepo.save(tag);
        }
        return tag;
      })
    );

    const existingTagIds = new Set(report.tags.map(t => t.id));
    const newTags = tagEntities.filter(t => !existingTagIds.has(t.id));
    
    report.tags = [...report.tags, ...newTags];
    return this.repo.save(report);
  }

  async removeTags(id: number, tagNames: string[]): Promise<Report> {
    const report = await this.findOne(id);
    
    report.tags = report.tags.filter(tag => !tagNames.includes(tag.name));
    
    return this.repo.save(report);
  }

  async remove(id: number): Promise<Report> {
    const report = await this.findOne(id);
    return this.repo.softRemove(report);
  }

  async restore(id: number): Promise<Report> {
    const report = await this.repo.findOne({
      where: { id },
      withDeleted: true
    });

    if (!report) throw new NotFoundException('Report not found');
    if (!report.deletedAt) {
      throw new NotFoundException('Report is not deleted');
    }

    return this.repo.recover(report);
  }

  async findDeleted(): Promise<Report[]> {
    return this.repo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.tags', 'tags')
      .withDeleted()
      .where('report.deletedAt IS NOT NULL')
      .getMany();
  }

  // ==========================================
  // IMAGE METHODS
  // ==========================================

  async createImage(
    reportId: number,
    filename: string,
    url: string,
    originalName: string,
    size: number,
    mimeType: string,
  ): Promise<ReportImage> {
    const image = this.imageRepo.create({
      reportId,
      filename,
      url,
      originalName,
      size,
      mimeType,
    });
    return this.imageRepo.save(image);
  }

  async findImageById(imageId: number): Promise<ReportImage> {
    const image = await this.imageRepo.findOne({
      where: { id: imageId },
      relations: ['report', 'report.user'],
    });
  
    // Check
    if (!image) {
      throw new NotFoundException('Image not found');
    }
  
    return image;
  }

  async deleteImage(imageId: number): Promise<void> {
    await this.imageRepo.delete(imageId);
  }

  async getReportImages(reportId: number): Promise<ReportImage[]> {
    return this.imageRepo.find({
      where: { reportId },
      order: { createdAt: 'DESC' },
    });
  }
}