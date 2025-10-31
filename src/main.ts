import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieSession from 'cookie-session'; // ✅ fixed import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cookieSession({
      keys: ['secretKey'], // replace with an environment variable
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

