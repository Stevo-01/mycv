import { DataSource } from 'typeorm';
import { Report } from '../../reports/report.entity';
import { User } from '../../users/user.entity';
import { ReportFactory } from '../factories/report.factory';

export class ReportSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const reportRepository = dataSource.getRepository(Report);
    const userRepository = dataSource.getRepository(User);

    console.log('Seeding reports...');

    // Delete all reports using query builder
    await reportRepository.createQueryBuilder().delete().execute();

    // Get all users
    const users = await userRepository.find();

    if (users.length === 0) {
      console.log(' No users found. Run user seeder first.');
      return;
    }

    let totalReports = 0;

    // Create reports for each user
    for (const user of users) {
      const reportCount = Math.floor(Math.random() * 5) + 1; // 1-5 reports per user
      const reportsData = ReportFactory.createMany(user.id, reportCount);
      const reports = reportRepository.create(reportsData);
      await reportRepository.save(reports);
      totalReports += reportCount;
    }

    console.log(`  Created ${totalReports} reports across ${users.length} users`);
    console.log(' Report seeding complete!\n');
  }
}