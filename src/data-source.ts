import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import * as dotenv from 'dotenv';
import { Tag } from './tags/tag.entity';

// Load .env.development
dotenv.config({ path: '.env.development' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'mycv_password',
  database: process.env.DB_NAME || 'postgres',
  
  entities: [User, Report, Tag],
  migrations: ['src/database/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;