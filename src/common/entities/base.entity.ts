import { 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  PrimaryGeneratedColumn 
} from 'typeorm';

/**
 * Base entity with soft delete support
 * All entities should extend this for consistent behavior
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}