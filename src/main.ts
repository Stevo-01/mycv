import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { initSentry } from './config/sentry.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Using Winston logger instead of default
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
  });

  // Add Helmet middleware (before other middleware)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MyCv API')
    .setDescription('The MyCv API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(8501);
  console.log('Application is running on: http://localhost:8501');
  console.log('Swagger is running on: http://localhost:8501/api');
  console.log('Health checks available at: http://localhost:8501/health');
}
bootstrap();