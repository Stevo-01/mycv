import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const email = 'hdjshfn@kpl.com';


    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({email: 'hdjshf12@kpl.com', password: 'kjahgds'})
      .expect(201)
      .then((res) => {
        const {id, email } =res.body;
        expect(id).toBeDefined;
        expect(email).toEqual(email)

      });
    });

    it('signup as a new user then get the currently logged in user', async () => {
      const email = 'asd3@asdf.com';
    
      // signup request
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: 'asdf3' })
        .expect(201);
    
      // get the real cookie
      const cookie = signupRes.get('Set-Cookie');
      expect(cookie).toBeDefined();
    
      // whoami request with valid cookie
      const whoamiRes = await request(app.getHttpServer())
        .get('/auth/whoami')
        .set('Cookie', cookie!) // pass the real cookie here
        .expect(200);
    
      expect(whoamiRes.body.email).toEqual(email);
    });
    
    
});
