import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';
import { Tag } from '../tags/tag.entity';
import { ReportImage } from './entities/report-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Tag, ReportImage])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}