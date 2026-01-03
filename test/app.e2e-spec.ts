import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same pipes as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();

    // Get DataSource for cleanup
    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up database after each test
    if (dataSource && dataSource.isInitialized) {
      const entities = dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`DELETE FROM "${entity.tableName}"`);
      }
    }
  });

  describe('Authentication Flow (E2E)', () => {
    const testUser = {
      email: 'e2e-test@example.com',
      password: 'password123',
    };

    let accessToken: string;

    it('/auth/signup (POST) - should create new user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(testUser.email);
          accessToken = res.body.accessToken;
        });
    });

    it('/auth/signup (POST) - should reject duplicate email', async () => {
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      // Try to create again
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('already in use');
        });
    });

    it('/auth/signin (POST) - should sign in user', async () => {
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      // Sign in
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('/auth/signin (POST) - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/users/whoami (GET) - should return current user', async () => {
      // Create user and get token
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      const token = signupRes.body.accessToken;

      // Get current user
      return request(app.getHttpServer())
        .get('/users/whoami')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('/users/whoami (GET) - should reject without token', () => {
      return request(app.getHttpServer())
        .get('/users/whoami')
        .expect(401);
    });
  });

  describe('Reports Flow (E2E)', () => {
    let accessToken: string;
    let userId: number;

    beforeEach(async () => {
      // Create user and get token
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'reporter@example.com',
          password: 'password123',
        });

      accessToken = res.body.accessToken;
      userId = res.body.user.id;
    });

    it('/reports (POST) - should create a report with tags', () => {
      return request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 50000,
          lng: -118.2437,
          lat: 34.0522,
          price: 25000,
          tags: ['sedan', 'low-mileage'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.make).toBe('Toyota');
          expect(res.body.model).toBe('Camry');
        });
    });

    it('/reports (POST) - should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          make: 'Toyota',
          // Missing required fields
        })
        .expect(400);
    });

    it('/reports/search (GET) - should search reports', async () => {
      // Create a report first
      await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          mileage: 40000,
          lng: -118.2437,
          lat: 34.0522,
          price: 20000,
        });

      // Search for it
      return request(app.getHttpServer())
        .get('/reports/search?q=honda')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta.total).toBeGreaterThan(0);
        });
    });

    it('/reports/:id (DELETE) - should soft delete report', async () => {
      // Create a report
      const createRes = await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          make: 'Ford',
          model: 'Focus',
          year: 2018,
          mileage: 60000,
          lng: -118.2437,
          lat: 34.0522,
          price: 15000,
        });

      const reportId = createRes.body.id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/reports/${reportId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify it's deleted
      return request(app.getHttpServer())
        .get(`/reports/${reportId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Pagination (E2E)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create user
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'paginator@example.com',
          password: 'password123',
        });

      accessToken = res.body.accessToken;

      // Create multiple reports
      for (let i = 0; i < 15; i++) {
        await request(app.getHttpServer())
          .post('/reports')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            make: `Make${i}`,
            model: `Model${i}`,
            year: 2020,
            mileage: 50000 + i * 1000,
            lng: -118.2437,
            lat: 34.0522,
            price: 20000 + i * 1000,
          });
      }
    });

    it('should paginate results correctly', () => {
      return request(app.getHttpServer())
        .get('/reports/search?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(5);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
          expect(res.body.meta.total).toBe(15);
          expect(res.body.meta.totalPages).toBe(3);
          expect(res.body.meta.hasNextPage).toBe(true);
          expect(res.body.meta.hasPreviousPage).toBe(false);
        });
    });

    it('should handle page 2 correctly', () => {
      return request(app.getHttpServer())
        .get('/reports/search?page=2&limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(5);
          expect(res.body.meta.page).toBe(2);
          expect(res.body.meta.hasNextPage).toBe(true);
          expect(res.body.meta.hasPreviousPage).toBe(true);
        });
    });
  });
});