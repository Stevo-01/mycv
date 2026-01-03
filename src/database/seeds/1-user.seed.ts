import { DataSource } from 'typeorm';
import { User } from '../../users/user.entity';
import { UserFactory } from '../factories/user.factory';

export class UserSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    console.log(' Seeding users...');

    // Delete all users using query builder
    await userRepository.createQueryBuilder().delete().execute();

    // Create admin user
    const adminData = await UserFactory.createAdmin();
    const admin = userRepository.create(adminData);
    await userRepository.save(admin);
    console.log(' Created admin user: admin@test.com (password: password123)');

    // Create regular test user
    const testUserData = await UserFactory.createRegularUser();
    const testUser = userRepository.create(testUserData);
    await userRepository.save(testUser);
    console.log(' Created test user: user@test.com (password: password123)');

    // Create 10 random users
    const randomUsersData = await UserFactory.createMany(10);
    const randomUsers = userRepository.create(randomUsersData);
    await userRepository.save(randomUsers);
    console.log(' Created 10 random users');

    console.log(' User seeding complete!\n');
  }
}