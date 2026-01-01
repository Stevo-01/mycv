import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private repo: Repository<Tag>,
  ) {}

  async findOrCreate(name: string): Promise<Tag> {
    let tag = await this.repo.findOne({ where: { name } });
    if (!tag) {
      tag = this.repo.create({ name });
      await this.repo.save(tag);
    }
    return tag;
  }

  async findAll(): Promise<Tag[]> {
    return this.repo.find();
  }
}