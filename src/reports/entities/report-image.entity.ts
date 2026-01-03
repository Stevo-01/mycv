import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from '../report.entity';

@Entity('report_images')
export class ReportImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  originalName: string;

  @Column({ type: 'int' })
  size: number;

  @Column()
  mimeType: string;

  @ManyToOne(() => Report, (report) => report.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column()
  reportId: number;

  @CreateDateColumn()
  createdAt: Date;
}