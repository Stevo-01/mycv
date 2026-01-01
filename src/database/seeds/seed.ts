import AppDataSource from '../../data-source';
import { UserSeeder } from './1-user.seed';
import { ReportSeeder } from './2-report.seed';

async function runSeeders() {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('📦 Database connected\n');

    // ✅ Run seeders in correct order: parents first
    const userSeeder = new UserSeeder();
    await userSeeder.run(AppDataSource);

    const reportSeeder = new ReportSeeder();
    await reportSeeder.run(AppDataSource);

    console.log('🎉 All seeds completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin: admin@test.com / password123');
    console.log('  User:  user@test.com / password123\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

runSeeders();
