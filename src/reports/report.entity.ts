import { Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
 } from 'typeorm';
import { User } from '../users/user.entity';
import { Tag } from '../tags/tag.entity';
@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  approved: boolean;

  @Column()
  price: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('numeric', { precision: 10, scale: 6 })  // ✅ Changed from integer to numeric
  lng: number;

  @Column('numeric', { precision: 10, scale: 6 })  // ✅ Changed from integer to numeric
  lat: number;

  @Column()
  mileage: number;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Soft Delete Column
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  // Adding cascade and onDelete behavior
  @ManyToOne(() => User, (user) => user.reports, {
    onDelete: 'CASCADE',  // Delete reports when user is deleted
    eager: false,         // Don't auto-load user with report (performance)
  })
  user: User;

  // Many-to-Many with Tags
  @ManyToMany(() => Tag, (tag) => tag.reports, {
    cascade: true,  // Auto-create tags when creating report
    eager: false,
  })
  @JoinTable({
    name: 'report_tags',  // Junction table name
    joinColumn: { name: 'reportId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];
}